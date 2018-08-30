/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as Platform from '../common/platform';
import { Event, Emitter } from '../common/event';
import { IDisposable } from '../common/lifecycle';

class WindowManager {

	public static readonly INSTANCE = new WindowManager();

	// --- Zoom Level
	private _zoomLevel: number = 0;
	private _lastZoomLevelChangeTime: number = 0;
	private readonly _onDidChangeZoomLevel: Emitter<number> = new Emitter<number>();

	public readonly onDidChangeZoomLevel: Event<number> = this._onDidChangeZoomLevel.event;
	public getZoomLevel(): number {
		return this._zoomLevel;
	}
	public getTimeSinceLastZoomLevelChanged(): number {
		return Date.now() - this._lastZoomLevelChangeTime;
	}


	// --- Pixel Ratio
	public getPixelRatio(): number {
		let ctx = document.createElement('canvas').getContext('2d');
		let dpr = window.devicePixelRatio || 1;
		let bsr = (<any>ctx).webkitBackingStorePixelRatio ||
			(<any>ctx).mozBackingStorePixelRatio ||
			(<any>ctx).msBackingStorePixelRatio ||
			(<any>ctx).oBackingStorePixelRatio ||
			(<any>ctx).backingStorePixelRatio || 1;
		return dpr / bsr;
	}

	// --- Accessibility
	private _accessibilitySupport = Platform.AccessibilitySupport.Unknown;
	private readonly _onDidChangeAccessibilitySupport: Emitter<void> = new Emitter<void>();

	public readonly onDidChangeAccessibilitySupport: Event<void> = this._onDidChangeAccessibilitySupport.event;
	public getAccessibilitySupport(): Platform.AccessibilitySupport {
		return this._accessibilitySupport;
	}


}
export function getZoomLevel(): number {
	return WindowManager.INSTANCE.getZoomLevel();
}
/** Returns the time (in ms) since the zoom level was changed */
export function getTimeSinceLastZoomLevelChanged(): number {
	return WindowManager.INSTANCE.getTimeSinceLastZoomLevelChanged();
}
export function onDidChangeZoomLevel(callback: (zoomLevel: number) => void): IDisposable {
	return WindowManager.INSTANCE.onDidChangeZoomLevel(callback);
}

export function getPixelRatio(): number {
	return WindowManager.INSTANCE.getPixelRatio();
}
export function getAccessibilitySupport(): Platform.AccessibilitySupport {
	return WindowManager.INSTANCE.getAccessibilitySupport();
}
export function onDidChangeAccessibilitySupport(callback: () => void): IDisposable {
	return WindowManager.INSTANCE.onDidChangeAccessibilitySupport(callback);
}

const userAgent = navigator.userAgent;

export const isIE = (userAgent.indexOf('Trident') >= 0);
export const isEdge = (userAgent.indexOf('Edge/') >= 0);
export const isEdgeOrIE = isIE || isEdge;
export const isFirefox = (userAgent.indexOf('Firefox') >= 0);
export const isWebKit = (userAgent.indexOf('AppleWebKit') >= 0);
export const isChrome = (userAgent.indexOf('Chrome') >= 0);
export const isSafari = (userAgent.indexOf('Chrome') === -1) && (userAgent.indexOf('Safari') >= 0);
export const isIPad = (userAgent.indexOf('iPad') >= 0);
export const isEdgeWebView = isEdge && (userAgent.indexOf('WebView/') >= 0);

export function hasClipboardSupport() {
	if (isIE) {
		return false;
	}

	if (isEdge) {
		let index = userAgent.indexOf('Edge/');
		let version = parseInt(userAgent.substring(index + 5, userAgent.indexOf('.', index)), 10);

		if (!version || (version >= 12 && version <= 16)) {
			return false;
		}
	}

	return true;
}