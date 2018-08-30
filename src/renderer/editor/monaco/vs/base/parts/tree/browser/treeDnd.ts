/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as _ from './tree';
import * as Mouse from '../../../browser/mouseEvent';

export class ElementsDragAndDropData implements _.IDragAndDropData {

	private elements: any[];

	constructor(elements: any[]) {
		this.elements = elements;
	}

	public update(event: Mouse.DragMouseEvent): void {
		// no-op
	}
}

export class ExternalElementsDragAndDropData implements _.IDragAndDropData {

	private elements: any[];

	constructor(elements: any[]) {
		this.elements = elements;
	}

	public update(event: Mouse.DragMouseEvent): void {
		// no-op
	}
}

export class DesktopDragAndDropData implements _.IDragAndDropData {

	private types: any[];
	private files: any[];

	constructor() {
		this.types = [];
		this.files = [];
	}

	public update(event: Mouse.DragMouseEvent): void {
		if (event.dataTransfer.types) {
			this.types = [];
			Array.prototype.push.apply(this.types, event.dataTransfer.types);
		}

		if (event.dataTransfer.files) {
			this.files = [];
			Array.prototype.push.apply(this.files, event.dataTransfer.files);

			this.files = this.files.filter(f => f.size || f.type);
		}
	}
}