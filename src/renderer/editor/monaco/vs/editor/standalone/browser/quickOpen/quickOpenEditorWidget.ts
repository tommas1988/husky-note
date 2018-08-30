/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { QuickOpenModel } from '../../../../base/parts/quickopen/browser/quickOpenModel';
import { QuickOpenWidget } from '../../../../base/parts/quickopen/browser/quickOpenWidget';
import { IAutoFocus } from '../../../../base/parts/quickopen/common/quickOpen';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition, OverlayWidgetPositionPreference } from '../../../browser/editorBrowser';
import { attachQuickOpenStyler } from '../../../../platform/theme/common/styler';
import { IDisposable } from '../../../../base/common/lifecycle';
import { IThemeService } from '../../../../platform/theme/common/themeService';
import { foreground } from '../../../../platform/theme/common/colorRegistry';
import { Dimension } from '../../../../base/browser/dom';

export interface IQuickOpenEditorWidgetOptions {
	inputAriaLabel: string;
}

export class QuickOpenEditorWidget implements IOverlayWidget {

	private static readonly ID = 'editor.contrib.quickOpenEditorWidget';

	private codeEditor: ICodeEditor;
	private themeService: IThemeService;
	private visible: boolean;
	private quickOpenWidget: QuickOpenWidget;
	private domNode: HTMLElement;
	private styler: IDisposable;

	constructor(codeEditor: ICodeEditor, onOk: () => void, onCancel: () => void, onType: (value: string) => void, configuration: IQuickOpenEditorWidgetOptions, themeService: IThemeService) {
		this.codeEditor = codeEditor;
		this.themeService = themeService;

		this.create(onOk, onCancel, onType, configuration);
	}

	private create(onOk: () => void, onCancel: () => void, onType: (value: string) => void, configuration: IQuickOpenEditorWidgetOptions): void {
		this.domNode = document.createElement('div');

		this.quickOpenWidget = new QuickOpenWidget(
			this.domNode,
			{
				onOk: onOk,
				onCancel: onCancel,
				onType: onType
			}, {
				inputPlaceHolder: null,
				inputAriaLabel: configuration.inputAriaLabel,
				keyboardSupport: true
			}
		);
		this.styler = attachQuickOpenStyler(this.quickOpenWidget, this.themeService, {
			pickerGroupForeground: foreground
		});

		this.quickOpenWidget.create();
		this.codeEditor.addOverlayWidget(this);
	}

	public setInput(model: QuickOpenModel, focus: IAutoFocus): void {
		this.quickOpenWidget.setInput(model, focus);
	}

	public getId(): string {
		return QuickOpenEditorWidget.ID;
	}

	public getDomNode(): HTMLElement {
		return this.domNode;
	}

	public destroy(): void {
		this.codeEditor.removeOverlayWidget(this);
		this.quickOpenWidget.dispose();
		this.styler.dispose();
	}

	public show(value: string): void {
		this.visible = true;

		const editorLayout = this.codeEditor.getLayoutInfo();
		if (editorLayout) {
			this.quickOpenWidget.layout(new Dimension(editorLayout.width, editorLayout.height));
		}

		this.quickOpenWidget.show(value);
		this.codeEditor.layoutOverlayWidget(this);
	}

	public getPosition(): IOverlayWidgetPosition {
		if (this.visible) {
			return {
				preference: OverlayWidgetPositionPreference.TOP_CENTER
			};
		}

		return null;
	}
}