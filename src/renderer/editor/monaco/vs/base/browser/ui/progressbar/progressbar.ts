/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import './progressbar.css';
import { TPromise, ValueCallback } from '../../../common/winjs.base';
import { Builder, $ } from '../../builder';
import * as DOM from '../../dom';
import { Disposable } from '../../../common/lifecycle';
import { Color } from '../../../common/color';
import { mixin } from '../../../common/objects';

const css_done = 'done';
const css_active = 'active';
const css_infinite = 'infinite';
const css_discrete = 'discrete';
const css_progress_container = 'monaco-progress-container';
const css_progress_bit = 'progress-bit';

export interface IProgressBarOptions extends IProgressBarStyles {
}

export interface IProgressBarStyles {
	progressBarBackground?: Color;
}

const defaultOpts = {
	progressBarBackground: Color.fromHex('#0E70C0')
};

/**
 * A progress bar with support for infinite or discrete progress.
 */
export class ProgressBar extends Disposable {
	private options: IProgressBarOptions;
	private workedVal: number;
	private element: Builder;
	private bit: HTMLElement;
	private totalWork: number;
	private animationStopToken: ValueCallback;
	private progressBarBackground: Color;

	constructor(container: HTMLElement, options?: IProgressBarOptions) {
		super();

		this.options = options || Object.create(null);
		mixin(this.options, defaultOpts, false);

		this.workedVal = 0;

		this.progressBarBackground = this.options.progressBarBackground;

		this.create(container);
	}

	private create(container: HTMLElement): void {
		$(container).div({ 'class': css_progress_container }, builder => {
			this.element = builder.clone();

			builder.div({ 'class': css_progress_bit }).on([DOM.EventType.ANIMATION_START, DOM.EventType.ANIMATION_END, DOM.EventType.ANIMATION_ITERATION], (e: Event) => {
				switch (e.type) {
					case DOM.EventType.ANIMATION_ITERATION:
						if (this.animationStopToken) {
							this.animationStopToken(null);
						}
						break;
				}

			}, this.toDispose);

			this.bit = builder.getHTMLElement();
		});

		this.applyStyles();
	}

	private off(): void {
		this.bit.style.width = 'inherit';
		this.bit.style.opacity = '1';
		this.element.removeClass(css_active);
		this.element.removeClass(css_infinite);
		this.element.removeClass(css_discrete);

		this.workedVal = 0;
		this.totalWork = undefined;
	}

	/**
	 * Stops the progressbar from showing any progress instantly without fading out.
	 */
	stop(): ProgressBar {
		return this.doDone(false);
	}

	private doDone(delayed: boolean): ProgressBar {
		this.element.addClass(css_done);

		// let it grow to 100% width and hide afterwards
		if (!this.element.hasClass(css_infinite)) {
			this.bit.style.width = 'inherit';

			if (delayed) {
				TPromise.timeout(200).then(() => this.off());
			} else {
				this.off();
			}
		}

		// let it fade out and hide afterwards
		else {
			this.bit.style.opacity = '0';
			if (delayed) {
				TPromise.timeout(200).then(() => this.off());
			} else {
				this.off();
			}
		}

		return this;
	}

	hide(): void {
		this.element.hide();
	}

	style(styles: IProgressBarStyles): void {
		this.progressBarBackground = styles.progressBarBackground;

		this.applyStyles();
	}

	protected applyStyles(): void {
		if (this.bit) {
			const background = this.progressBarBackground ? this.progressBarBackground.toString() : null;

			this.bit.style.backgroundColor = background;
		}
	}
}