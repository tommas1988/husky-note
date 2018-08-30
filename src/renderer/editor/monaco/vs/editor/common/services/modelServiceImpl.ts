/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as nls from '../../../nls';
import * as network from '../../../base/common/network';
import { Event, Emitter } from '../../../base/common/event';
import { MarkdownString } from '../../../base/common/htmlContent';
import { IDisposable, dispose } from '../../../base/common/lifecycle';
import URI from '../../../base/common/uri';
import { TPromise } from '../../../base/common/winjs.base';
import { IMarker, IMarkerService, MarkerSeverity, MarkerTag } from '../../../platform/markers/common/markers';
import { Range } from '../core/range';
import { TextModel } from '../model/textModel';
import { IMode, LanguageIdentifier } from '../modes';
import { IModelService } from './modelService';
import * as platform from '../../../base/common/platform';
import { IConfigurationService } from '../../../platform/configuration/common/configuration';
import { EDITOR_MODEL_DEFAULTS } from '../config/editorOptions';
import { PLAINTEXT_LANGUAGE_IDENTIFIER } from '../modes/modesRegistry';
import { IModelLanguageChangedEvent } from '../model/textModelEvents';
import { ClassName } from '../model/intervalTree';
import { themeColorFromId, ThemeColor } from '../../../platform/theme/common/themeService';
import { overviewRulerWarning, overviewRulerError, overviewRulerInfo } from '../view/editorColorRegistry';
import { ITextModel, IModelDeltaDecoration, IModelDecorationOptions, TrackedRangeStickiness, OverviewRulerLane, DefaultEndOfLine, ITextModelCreationOptions, ITextBufferFactory } from '../model';
import { isFalsyOrEmpty } from '../../../base/common/arrays';
import { basename } from '../../../base/common/paths';

function MODEL_ID(resource: URI): string {
	return resource.toString();
}

class ModelData implements IDisposable {
	model: ITextModel;

	private _markerDecorations: string[];
	private _modelEventListeners: IDisposable[];

	constructor(
		model: ITextModel,
		onWillDispose: (model: ITextModel) => void,
		onDidChangeLanguage: (model: ITextModel, e: IModelLanguageChangedEvent) => void
	) {
		this.model = model;

		this._markerDecorations = [];

		this._modelEventListeners = [];
		this._modelEventListeners.push(model.onWillDispose(() => onWillDispose(model)));
		this._modelEventListeners.push(model.onDidChangeLanguage((e) => onDidChangeLanguage(model, e)));
	}

	public dispose(): void {
		this._markerDecorations = this.model.deltaDecorations(this._markerDecorations, []);
		this._modelEventListeners = dispose(this._modelEventListeners);
		this.model = null;
	}

	public acceptMarkerDecorations(newDecorations: IModelDeltaDecoration[]): void {
		this._markerDecorations = this.model.deltaDecorations(this._markerDecorations, newDecorations);
	}
}

class ModelMarkerHandler {

	public static setMarkers(modelData: ModelData, markerService: IMarkerService): void {

		// Limit to the first 500 errors/warnings
		const markers = markerService.read({ resource: modelData.model.uri, take: 500 });

		let newModelDecorations: IModelDeltaDecoration[] = markers.map((marker) => {
			return {
				range: this._createDecorationRange(modelData.model, marker),
				options: this._createDecorationOption(marker)
			};
		});

		modelData.acceptMarkerDecorations(newModelDecorations);
	}

	private static _createDecorationRange(model: ITextModel, rawMarker: IMarker): Range {

		let ret = Range.lift(rawMarker);

		if (rawMarker.severity === MarkerSeverity.Hint && Range.spansMultipleLines(ret)) {
			// never render hints on multiple lines
			ret = ret.setEndPosition(ret.startLineNumber, ret.startColumn);
		}

		ret = model.validateRange(ret);

		if (ret.isEmpty()) {
			let word = model.getWordAtPosition(ret.getStartPosition());
			if (word) {
				ret = new Range(ret.startLineNumber, word.startColumn, ret.endLineNumber, word.endColumn);
			} else {
				let maxColumn = model.getLineLastNonWhitespaceColumn(ret.startLineNumber) ||
					model.getLineMaxColumn(ret.startLineNumber);

				if (maxColumn === 1) {
					// empty line
					// console.warn('marker on empty line:', marker);
				} else if (ret.endColumn >= maxColumn) {
					// behind eol
					ret = new Range(ret.startLineNumber, maxColumn - 1, ret.endLineNumber, maxColumn);
				} else {
					// extend marker to width = 1
					ret = new Range(ret.startLineNumber, ret.startColumn, ret.endLineNumber, ret.endColumn + 1);
				}
			}
		} else if (rawMarker.endColumn === Number.MAX_VALUE && rawMarker.startColumn === 1 && ret.startLineNumber === ret.endLineNumber) {
			let minColumn = model.getLineFirstNonWhitespaceColumn(rawMarker.startLineNumber);
			if (minColumn < ret.endColumn) {
				ret = new Range(ret.startLineNumber, minColumn, ret.endLineNumber, ret.endColumn);
				rawMarker.startColumn = minColumn;
			}
		}
		return ret;
	}

	private static _createDecorationOption(marker: IMarker): IModelDecorationOptions {

		let className: string;
		let color: ThemeColor;
		let darkColor: ThemeColor;
		let zIndex: number;
		let inlineClassName: string;

		switch (marker.severity) {
			case MarkerSeverity.Hint:
				if (marker.tags && marker.tags.indexOf(MarkerTag.Unnecessary) >= 0) {
					className = ClassName.EditorUnnecessaryDecoration;
				} else {
					className = ClassName.EditorHintDecoration;
				}
				zIndex = 0;
				break;
			case MarkerSeverity.Warning:
				className = ClassName.EditorWarningDecoration;
				color = themeColorFromId(overviewRulerWarning);
				darkColor = themeColorFromId(overviewRulerWarning);
				zIndex = 20;
				break;
			case MarkerSeverity.Info:
				className = ClassName.EditorInfoDecoration;
				color = themeColorFromId(overviewRulerInfo);
				darkColor = themeColorFromId(overviewRulerInfo);
				zIndex = 10;
				break;
			case MarkerSeverity.Error:
			default:
				className = ClassName.EditorErrorDecoration;
				color = themeColorFromId(overviewRulerError);
				darkColor = themeColorFromId(overviewRulerError);
				zIndex = 30;
				break;
		}

		if (marker.tags) {
			if (marker.tags.indexOf(MarkerTag.Unnecessary) !== -1) {
				inlineClassName = ClassName.EditorUnnecessaryInlineDecoration;
			}
		}

		let hoverMessage: MarkdownString = null;
		let { message, source, relatedInformation } = marker;

		if (typeof message === 'string') {
			message = message.trim();

			if (source) {
				if (/\n/g.test(message)) {
					message = nls.localize('diagAndSourceMultiline', "[{0}]\n{1}", source, message);
				} else {
					message = nls.localize('diagAndSource', "[{0}] {1}", source, message);
				}
			}

			hoverMessage = new MarkdownString().appendCodeblock('_', message);

			if (!isFalsyOrEmpty(relatedInformation)) {
				hoverMessage.appendMarkdown('\n');
				for (const { message, resource, startLineNumber, startColumn } of relatedInformation) {
					hoverMessage.appendMarkdown(
						`* [${basename(resource.path)}(${startLineNumber}, ${startColumn})](${resource.toString(false)}#${startLineNumber},${startColumn}): `
					);
					hoverMessage.appendText(`${message}`);
					hoverMessage.appendMarkdown('\n');
				}
				hoverMessage.appendMarkdown('\n');
			}
		}

		return {
			stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
			className,
			hoverMessage,
			showIfCollapsed: true,
			overviewRuler: {
				color,
				darkColor,
				position: OverviewRulerLane.Right
			},
			zIndex,
			inlineClassName,
		};
	}
}

interface IRawConfig {
	files?: {
		eol?: any;
	};
	editor?: {
		tabSize?: any;
		insertSpaces?: any;
		detectIndentation?: any;
		trimAutoWhitespace?: any;
		creationOptions?: any;
		largeFileOptimizations?: any;
	};
}

const DEFAULT_EOL = (platform.isLinux || platform.isMacintosh) ? DefaultEndOfLine.LF : DefaultEndOfLine.CRLF;

export class ModelServiceImpl implements IModelService {
	public _serviceBrand: any;

	private _markerService: IMarkerService;
	private _markerServiceSubscription: IDisposable;
	private _configurationService: IConfigurationService;
	private _configurationServiceSubscription: IDisposable;

	private readonly _onModelAdded: Emitter<ITextModel>;
	private readonly _onModelRemoved: Emitter<ITextModel>;
	private readonly _onModelModeChanged: Emitter<{ model: ITextModel; oldModeId: string; }>;

	private _modelCreationOptionsByLanguageAndResource: {
		[languageAndResource: string]: ITextModelCreationOptions;
	};

	/**
	 * All the models known in the system.
	 */
	private _models: { [modelId: string]: ModelData; };

	constructor(
		@IMarkerService markerService: IMarkerService,
		@IConfigurationService configurationService: IConfigurationService,
	) {
		this._markerService = markerService;
		this._configurationService = configurationService;
		this._models = {};
		this._modelCreationOptionsByLanguageAndResource = Object.create(null);
		this._onModelAdded = new Emitter<ITextModel>();
		this._onModelRemoved = new Emitter<ITextModel>();
		this._onModelModeChanged = new Emitter<{ model: ITextModel; oldModeId: string; }>();

		if (this._markerService) {
			this._markerServiceSubscription = this._markerService.onMarkerChanged(this._handleMarkerChange, this);
		}

		this._configurationServiceSubscription = this._configurationService.onDidChangeConfiguration(e => this._updateModelOptions());
		this._updateModelOptions();
	}

	private static _readModelOptions(config: IRawConfig, isForSimpleWidget: boolean): ITextModelCreationOptions {
		let tabSize = EDITOR_MODEL_DEFAULTS.tabSize;
		if (config.editor && typeof config.editor.tabSize !== 'undefined') {
			let parsedTabSize = parseInt(config.editor.tabSize, 10);
			if (!isNaN(parsedTabSize)) {
				tabSize = parsedTabSize;
			}
			if (tabSize < 1) {
				tabSize = 1;
			}
		}

		let insertSpaces = EDITOR_MODEL_DEFAULTS.insertSpaces;
		if (config.editor && typeof config.editor.insertSpaces !== 'undefined') {
			insertSpaces = (config.editor.insertSpaces === 'false' ? false : Boolean(config.editor.insertSpaces));
		}

		let newDefaultEOL = DEFAULT_EOL;
		const eol = config.files && config.files.eol;
		if (eol === '\r\n') {
			newDefaultEOL = DefaultEndOfLine.CRLF;
		} else if (eol === '\n') {
			newDefaultEOL = DefaultEndOfLine.LF;
		}

		let trimAutoWhitespace = EDITOR_MODEL_DEFAULTS.trimAutoWhitespace;
		if (config.editor && typeof config.editor.trimAutoWhitespace !== 'undefined') {
			trimAutoWhitespace = (config.editor.trimAutoWhitespace === 'false' ? false : Boolean(config.editor.trimAutoWhitespace));
		}

		let detectIndentation = EDITOR_MODEL_DEFAULTS.detectIndentation;
		if (config.editor && typeof config.editor.detectIndentation !== 'undefined') {
			detectIndentation = (config.editor.detectIndentation === 'false' ? false : Boolean(config.editor.detectIndentation));
		}

		let largeFileOptimizations = EDITOR_MODEL_DEFAULTS.largeFileOptimizations;
		if (config.editor && typeof config.editor.largeFileOptimizations !== 'undefined') {
			largeFileOptimizations = (config.editor.largeFileOptimizations === 'false' ? false : Boolean(config.editor.largeFileOptimizations));
		}

		return {
			isForSimpleWidget: isForSimpleWidget,
			tabSize: tabSize,
			insertSpaces: insertSpaces,
			detectIndentation: detectIndentation,
			defaultEOL: newDefaultEOL,
			trimAutoWhitespace: trimAutoWhitespace,
			largeFileOptimizations: largeFileOptimizations
		};
	}

	public getCreationOptions(language: string, resource: URI, isForSimpleWidget: boolean): ITextModelCreationOptions {
		let creationOptions = this._modelCreationOptionsByLanguageAndResource[language + resource];
		if (!creationOptions) {
			creationOptions = ModelServiceImpl._readModelOptions(this._configurationService.getValue({ overrideIdentifier: language, resource }), isForSimpleWidget);
			this._modelCreationOptionsByLanguageAndResource[language + resource] = creationOptions;
		}
		return creationOptions;
	}

	private _updateModelOptions(): void {
		let oldOptionsByLanguageAndResource = this._modelCreationOptionsByLanguageAndResource;
		this._modelCreationOptionsByLanguageAndResource = Object.create(null);

		// Update options on all models
		let keys = Object.keys(this._models);
		for (let i = 0, len = keys.length; i < len; i++) {
			let modelId = keys[i];
			let modelData = this._models[modelId];
			const language = modelData.model.getLanguageIdentifier().language;
			const uri = modelData.model.uri;
			const oldOptions = oldOptionsByLanguageAndResource[language + uri];
			const newOptions = this.getCreationOptions(language, uri, modelData.model.isForSimpleWidget);
			ModelServiceImpl._setModelOptionsForModel(modelData.model, newOptions, oldOptions);
		}
	}

	private static _setModelOptionsForModel(model: ITextModel, newOptions: ITextModelCreationOptions, currentOptions: ITextModelCreationOptions): void {
		if (currentOptions
			&& (currentOptions.detectIndentation === newOptions.detectIndentation)
			&& (currentOptions.insertSpaces === newOptions.insertSpaces)
			&& (currentOptions.tabSize === newOptions.tabSize)
			&& (currentOptions.trimAutoWhitespace === newOptions.trimAutoWhitespace)
		) {
			// Same indent opts, no need to touch the model
			return;
		}

		if (newOptions.detectIndentation) {
			model.detectIndentation(newOptions.insertSpaces, newOptions.tabSize);
			model.updateOptions({
				trimAutoWhitespace: newOptions.trimAutoWhitespace
			});
		} else {
			model.updateOptions({
				insertSpaces: newOptions.insertSpaces,
				tabSize: newOptions.tabSize,
				trimAutoWhitespace: newOptions.trimAutoWhitespace
			});
		}
	}

	public dispose(): void {
		if (this._markerServiceSubscription) {
			this._markerServiceSubscription.dispose();
		}
		this._configurationServiceSubscription.dispose();
	}

	private _handleMarkerChange(changedResources: URI[]): void {
		changedResources.forEach((resource) => {
			let modelId = MODEL_ID(resource);
			let modelData = this._models[modelId];
			if (!modelData) {
				return;
			}
			ModelMarkerHandler.setMarkers(modelData, this._markerService);
		});
	}

	private _cleanUp(model: ITextModel): void {
		// clean up markers for internal, transient models
		if (model.uri.scheme === network.Schemas.inMemory
			|| model.uri.scheme === network.Schemas.internal
			|| model.uri.scheme === network.Schemas.vscode) {
			if (this._markerService) {
				this._markerService.read({ resource: model.uri }).map(marker => marker.owner).forEach(owner => this._markerService.remove(owner, [model.uri]));
			}
		}

		// clean up cache
		delete this._modelCreationOptionsByLanguageAndResource[model.getLanguageIdentifier().language + model.uri];
	}

	// --- begin IModelService

	private _createModelData(value: string | ITextBufferFactory, languageIdentifier: LanguageIdentifier, resource: URI, isForSimpleWidget: boolean): ModelData {
		// create & save the model
		const options = this.getCreationOptions(languageIdentifier.language, resource, isForSimpleWidget);
		const model: TextModel = new TextModel(value, options, languageIdentifier, resource);
		const modelId = MODEL_ID(model.uri);

		if (this._models[modelId]) {
			// There already exists a model with this id => this is a programmer error
			throw new Error('ModelService: Cannot add model because it already exists!');
		}

		const modelData = new ModelData(
			model,
			(model) => this._onWillDispose(model),
			(model, e) => this._onDidChangeLanguage(model, e)
		);
		this._models[modelId] = modelData;

		return modelData;
	}

	public createModel(value: string | ITextBufferFactory, modeOrPromise: TPromise<IMode> | IMode, resource: URI, isForSimpleWidget: boolean = false): ITextModel {
		let modelData: ModelData;

		if (!modeOrPromise || TPromise.is(modeOrPromise)) {
			modelData = this._createModelData(value, PLAINTEXT_LANGUAGE_IDENTIFIER, resource, isForSimpleWidget);
			this.setMode(modelData.model, modeOrPromise);
		} else {
			modelData = this._createModelData(value, modeOrPromise.getLanguageIdentifier(), resource, isForSimpleWidget);
		}

		// handle markers (marker service => model)
		if (this._markerService) {
			ModelMarkerHandler.setMarkers(modelData, this._markerService);
		}

		this._onModelAdded.fire(modelData.model);

		return modelData.model;
	}

	public setMode(model: ITextModel, modeOrPromise: TPromise<IMode> | IMode): void {
		if (!modeOrPromise) {
			return;
		}
		if (TPromise.is(modeOrPromise)) {
			modeOrPromise.then((mode) => {
				if (!model.isDisposed()) {
					model.setMode(mode.getLanguageIdentifier());
				}
			});
		} else {
			model.setMode(modeOrPromise.getLanguageIdentifier());
		}
	}

	public getModels(): ITextModel[] {
		let ret: ITextModel[] = [];

		let keys = Object.keys(this._models);
		for (let i = 0, len = keys.length; i < len; i++) {
			let modelId = keys[i];
			ret.push(this._models[modelId].model);
		}

		return ret;
	}

	public getModel(resource: URI): ITextModel {
		let modelId = MODEL_ID(resource);
		let modelData = this._models[modelId];
		if (!modelData) {
			return null;
		}
		return modelData.model;
	}

	public get onModelAdded(): Event<ITextModel> {
		return this._onModelAdded ? this._onModelAdded.event : null;
	}

	public get onModelRemoved(): Event<ITextModel> {
		return this._onModelRemoved ? this._onModelRemoved.event : null;
	}

	public get onModelModeChanged(): Event<{ model: ITextModel; oldModeId: string; }> {
		return this._onModelModeChanged ? this._onModelModeChanged.event : null;
	}

	// --- end IModelService

	private _onWillDispose(model: ITextModel): void {
		let modelId = MODEL_ID(model.uri);
		let modelData = this._models[modelId];

		delete this._models[modelId];
		modelData.dispose();

		this._cleanUp(model);
		this._onModelRemoved.fire(model);
	}

	private _onDidChangeLanguage(model: ITextModel, e: IModelLanguageChangedEvent): void {
		const oldModeId = e.oldLanguage;
		const newModeId = model.getLanguageIdentifier().language;
		const oldOptions = this.getCreationOptions(oldModeId, model.uri, model.isForSimpleWidget);
		const newOptions = this.getCreationOptions(newModeId, model.uri, model.isForSimpleWidget);
		ModelServiceImpl._setModelOptionsForModel(model, newOptions, oldOptions);
		this._onModelModeChanged.fire({ model, oldModeId });
	}
}
