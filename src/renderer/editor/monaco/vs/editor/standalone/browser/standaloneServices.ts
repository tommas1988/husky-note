/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { Disposable } from '../../../base/common/lifecycle';
import { IConfigurationService } from '../../../platform/configuration/common/configuration';
import { ContextMenuService } from '../../../platform/contextview/browser/contextMenuService';
import { IContextMenuService, IContextViewService } from '../../../platform/contextview/browser/contextView';
import { ContextViewService } from '../../../platform/contextview/browser/contextViewService';
import { createDecorator, IInstantiationService, ServiceIdentifier } from '../../../platform/instantiation/common/instantiation';
import { InstantiationService } from '../../../platform/instantiation/common/instantiationService';
import { ServiceCollection } from '../../../platform/instantiation/common/serviceCollection';
import { ICommandService } from '../../../platform/commands/common/commands';
import { IKeybindingService } from '../../../platform/keybinding/common/keybinding';
import { IContextKeyService } from '../../../platform/contextkey/common/contextkey';
import { MarkerService } from '../../../platform/markers/common/markerService';
import { IMarkerService } from '../../../platform/markers/common/markers';
import { IProgressService } from '../../../platform/progress/common/progress';
import { IStorageService, NullStorageService } from '../../../platform/storage/common/storage';
import { ITelemetryService } from '../../../platform/telemetry/common/telemetry';
import { IWorkspaceContextService } from '../../../platform/workspace/common/workspace';
import { ICodeEditorService } from '../../browser/services/codeEditorService';
import { IEditorWorkerService } from '../../common/services/editorWorkerService';
import { EditorWorkerServiceImpl } from '../../common/services/editorWorkerServiceImpl';
import { ITextResourceConfigurationService } from '../../common/services/resourceConfiguration';
import { IModeService } from '../../common/services/modeService';
import { ModeServiceImpl } from '../../common/services/modeServiceImpl';
import { IModelService } from '../../common/services/modelService';
import { ModelServiceImpl } from '../../common/services/modelServiceImpl';
import { StandaloneCodeEditorServiceImpl } from './standaloneCodeServiceImpl';
import {
	SimpleConfigurationService, SimpleResourceConfigurationService, SimpleMenuService,
	SimpleProgressService, StandaloneCommandService, StandaloneKeybindingService, SimpleNotificationService,
	StandaloneTelemetryService, SimpleWorkspaceContextService, SimpleDialogService, SimpleBulkEditService, SimpleUriDisplayService } from './simpleServices';
import { ContextKeyService } from '../../../platform/contextkey/browser/contextKeyService';
import { IMenuService } from '../../../platform/actions/common/actions';
import { IStandaloneThemeService } from '../common/standaloneThemeService';
import { StandaloneThemeServiceImpl } from './standaloneThemeServiceImpl';
import { ILogService, NullLogService } from '../../../platform/log/common/log';
import { INotificationService } from '../../../platform/notification/common/notification';
import { IDialogService } from '../../../platform/dialogs/common/dialogs';
import { IListService, ListService } from '../../../platform/list/browser/listService';
import { IBulkEditService } from '../../browser/services/bulkEditService';
import { IUriDisplayService } from '../../../platform/uriDisplay/common/uriDisplay';

export interface IEditorOverrideServices {
	[index: string]: any;
}

export module StaticServices {

	const _serviceCollection = new ServiceCollection();

	export class LazyStaticService<T> {
		private _serviceId: ServiceIdentifier<T>;
		private _factory: (overrides: IEditorOverrideServices) => T;
		private _value: T;

		public get id() { return this._serviceId; }

		constructor(serviceId: ServiceIdentifier<T>, factory: (overrides: IEditorOverrideServices) => T) {
			this._serviceId = serviceId;
			this._factory = factory;
			this._value = null;
		}

		public get(overrides?: IEditorOverrideServices): T {
			if (!this._value) {
				if (overrides) {
					this._value = overrides[this._serviceId.toString()];
				}
				if (!this._value) {
					this._value = this._factory(overrides);
				}
				if (!this._value) {
					throw new Error('Service ' + this._serviceId + ' is missing!');
				}
				_serviceCollection.set(this._serviceId, this._value);
			}
			return this._value;
		}
	}

	let _all: LazyStaticService<any>[] = [];

	function define<T>(serviceId: ServiceIdentifier<T>, factory: (overrides: IEditorOverrideServices) => T): LazyStaticService<T> {
		let r = new LazyStaticService(serviceId, factory);
		_all.push(r);
		return r;
	}

	export function init(overrides: IEditorOverrideServices): [ServiceCollection, IInstantiationService] {
		// Create a fresh service collection
		let result = new ServiceCollection();

		// Initialize the service collection with the overrides
		for (let serviceId in overrides) {
			if (overrides.hasOwnProperty(serviceId)) {
				result.set(createDecorator(serviceId), overrides[serviceId]);
			}
		}

		// Make sure the same static services are present in all service collections
		_all.forEach(service => result.set(service.id, service.get(overrides)));

		// Ensure the collection gets the correct instantiation service
		let instantiationService = new InstantiationService(result, true);
		result.set(IInstantiationService, instantiationService);

		return [result, instantiationService];
	}

	export const instantiationService = define<IInstantiationService>(IInstantiationService, () => new InstantiationService(_serviceCollection, true));

	const configurationServiceImpl = new SimpleConfigurationService();
	export const configurationService = define(IConfigurationService, () => configurationServiceImpl);

	export const resourceConfigurationService = define(ITextResourceConfigurationService, () => new SimpleResourceConfigurationService(configurationServiceImpl));

	export const contextService = define(IWorkspaceContextService, () => new SimpleWorkspaceContextService());

	export const uriDisplayService = define(IUriDisplayService, () => new SimpleUriDisplayService());

	export const telemetryService = define(ITelemetryService, () => new StandaloneTelemetryService());

	export const dialogService = define(IDialogService, () => new SimpleDialogService());

	export const notificationService = define(INotificationService, () => new SimpleNotificationService());

	export const markerService = define(IMarkerService, () => new MarkerService());

	export const modeService = define(IModeService, (o) => new ModeServiceImpl());

	export const modelService = define(IModelService, (o) => new ModelServiceImpl(markerService.get(o), configurationService.get(o)));

	export const editorWorkerService = define(IEditorWorkerService, (o) => new EditorWorkerServiceImpl(modelService.get(o), resourceConfigurationService.get(o)));

	export const standaloneThemeService = define(IStandaloneThemeService, () => new StandaloneThemeServiceImpl());

	export const codeEditorService = define(ICodeEditorService, (o) => new StandaloneCodeEditorServiceImpl(standaloneThemeService.get(o)));

	export const progressService = define(IProgressService, () => new SimpleProgressService());

	export const storageService = define(IStorageService, () => NullStorageService);

	export const logService = define(ILogService, () => new NullLogService());

}

export class DynamicStandaloneServices extends Disposable {

	private _serviceCollection: ServiceCollection;
	private _instantiationService: IInstantiationService;

	constructor(domElement: HTMLElement, overrides: IEditorOverrideServices) {
		super();

		const [_serviceCollection, _instantiationService] = StaticServices.init(overrides);
		this._serviceCollection = _serviceCollection;
		this._instantiationService = _instantiationService;

		const configurationService = this.get(IConfigurationService);
		const notificationService = this.get(INotificationService);
		const telemetryService = this.get(ITelemetryService);

		let ensure = <T>(serviceId: ServiceIdentifier<T>, factory: () => T): T => {
			let value: T = null;
			if (overrides) {
				value = overrides[serviceId.toString()];
			}
			if (!value) {
				value = factory();
			}
			this._serviceCollection.set(serviceId, value);
			return value;
		};

		let contextKeyService = ensure(IContextKeyService, () => this._register(new ContextKeyService(configurationService)));

		ensure(IListService, () => new ListService(contextKeyService));

		let commandService = ensure(ICommandService, () => new StandaloneCommandService(this._instantiationService));

		ensure(IKeybindingService, () => this._register(new StandaloneKeybindingService(contextKeyService, commandService, telemetryService, notificationService, domElement)));

		let contextViewService = ensure(IContextViewService, () => this._register(new ContextViewService(domElement, telemetryService, new NullLogService())));

		ensure(IContextMenuService, () => this._register(new ContextMenuService(domElement, telemetryService, notificationService, contextViewService)));

		ensure(IMenuService, () => new SimpleMenuService(commandService));

		ensure(IBulkEditService, () => new SimpleBulkEditService(StaticServices.modelService.get(IModelService)));
	}

	public get<T>(serviceId: ServiceIdentifier<T>): T {
		let r = <T>this._serviceCollection.get(serviceId);
		if (!r) {
			throw new Error('Missing service ' + serviceId);
		}
		return r;
	}

	public set<T>(serviceId: ServiceIdentifier<T>, instance: T): void {
		this._serviceCollection.set(serviceId, instance);
	}

	public has<T>(serviceId: ServiceIdentifier<T>): boolean {
		return this._serviceCollection.has(serviceId);
	}
}
