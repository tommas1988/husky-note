/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import './findInput.css';

import * as nls from '../../../../nls';
import * as dom from '../../dom';
import { IInputValidator, IInputBoxStyles, HistoryInputBox } from '../inputbox/inputBox';
import { IContextViewProvider } from '../contextview/contextview';
import { Widget } from '../widget';
import { Event, Emitter } from '../../../common/event';
import { IKeyboardEvent } from '../../keyboardEvent';
import { IMouseEvent } from '../../mouseEvent';
import { KeyCode } from '../../../common/keyCodes';
import { CaseSensitiveCheckbox, WholeWordsCheckbox, RegexCheckbox } from './findInputCheckboxes';
import { Color } from '../../../common/color';
import { ICheckboxStyles } from '../checkbox/checkbox';

export interface IFindInputOptions extends IFindInputStyles {
	readonly placeholder?: string;
	readonly width?: number;
	readonly validation?: IInputValidator;
	readonly label: string;

	readonly appendCaseSensitiveLabel?: string;
	readonly appendWholeWordsLabel?: string;
	readonly appendRegexLabel?: string;
	readonly history?: string[];
}

export interface IFindInputStyles extends IInputBoxStyles {
	inputActiveOptionBorder?: Color;
}

const NLS_DEFAULT_LABEL = nls.localize('defaultLabel', "input");

export class FindInput extends Widget {

	private contextViewProvider: IContextViewProvider;
	private width: number;
	private placeholder: string;
	private validation: IInputValidator;
	private label: string;

	private inputActiveOptionBorder: Color;
	private inputBackground: Color;
	private inputForeground: Color;
	private inputBorder: Color;

	private inputValidationInfoBorder: Color;
	private inputValidationInfoBackground: Color;
	private inputValidationWarningBorder: Color;
	private inputValidationWarningBackground: Color;
	private inputValidationErrorBorder: Color;
	private inputValidationErrorBackground: Color;

	private regex: RegexCheckbox;
	private wholeWords: WholeWordsCheckbox;
	private caseSensitive: CaseSensitiveCheckbox;
	public domNode: HTMLElement;
	public inputBox: HistoryInputBox;

	private readonly _onDidOptionChange = this._register(new Emitter<boolean>());
	public readonly onDidOptionChange: Event<boolean /* via keyboard */> = this._onDidOptionChange.event;

	private readonly _onKeyDown = this._register(new Emitter<IKeyboardEvent>());
	public readonly onKeyDown: Event<IKeyboardEvent> = this._onKeyDown.event;

	private readonly _onMouseDown = this._register(new Emitter<IMouseEvent>());
	public readonly onMouseDown: Event<IMouseEvent> = this._onMouseDown.event;

	private readonly _onInput = this._register(new Emitter<void>());

	private readonly _onKeyUp = this._register(new Emitter<IKeyboardEvent>());

	private _onCaseSensitiveKeyDown = this._register(new Emitter<IKeyboardEvent>());
	public readonly onCaseSensitiveKeyDown: Event<IKeyboardEvent> = this._onCaseSensitiveKeyDown.event;

	private _onRegexKeyDown = this._register(new Emitter<IKeyboardEvent>());

	constructor(parent: HTMLElement, contextViewProvider: IContextViewProvider, options?: IFindInputOptions) {
		super();
		this.contextViewProvider = contextViewProvider;
		this.width = options.width || 100;
		this.placeholder = options.placeholder || '';
		this.validation = options.validation;
		this.label = options.label || NLS_DEFAULT_LABEL;

		this.inputActiveOptionBorder = options.inputActiveOptionBorder;
		this.inputBackground = options.inputBackground;
		this.inputForeground = options.inputForeground;
		this.inputBorder = options.inputBorder;

		this.inputValidationInfoBorder = options.inputValidationInfoBorder;
		this.inputValidationInfoBackground = options.inputValidationInfoBackground;
		this.inputValidationWarningBorder = options.inputValidationWarningBorder;
		this.inputValidationWarningBackground = options.inputValidationWarningBackground;
		this.inputValidationErrorBorder = options.inputValidationErrorBorder;
		this.inputValidationErrorBackground = options.inputValidationErrorBackground;

		this.regex = null;
		this.wholeWords = null;
		this.caseSensitive = null;
		this.domNode = null;
		this.inputBox = null;

		this.buildDomNode(options.appendCaseSensitiveLabel || '', options.appendWholeWordsLabel || '', options.appendRegexLabel || '', options.history);

		if (Boolean(parent)) {
			parent.appendChild(this.domNode);
		}

		this.onkeydown(this.inputBox.inputElement, (e) => this._onKeyDown.fire(e));
		this.onkeyup(this.inputBox.inputElement, (e) => this._onKeyUp.fire(e));
		this.oninput(this.inputBox.inputElement, (e) => this._onInput.fire());
		this.onmousedown(this.inputBox.inputElement, (e) => this._onMouseDown.fire(e));
	}

	public enable(): void {
		dom.removeClass(this.domNode, 'disabled');
		this.inputBox.enable();
		this.regex.enable();
		this.wholeWords.enable();
		this.caseSensitive.enable();
	}

	public disable(): void {
		dom.addClass(this.domNode, 'disabled');
		this.inputBox.disable();
		this.regex.disable();
		this.wholeWords.disable();
		this.caseSensitive.disable();
	}

	public setEnabled(enabled: boolean): void {
		if (enabled) {
			this.enable();
		} else {
			this.disable();
		}
	}

	public getValue(): string {
		return this.inputBox.value;
	}

	public setValue(value: string): void {
		if (this.inputBox.value !== value) {
			this.inputBox.value = value;
		}
	}

	public style(styles: IFindInputStyles): void {
		this.inputActiveOptionBorder = styles.inputActiveOptionBorder;
		this.inputBackground = styles.inputBackground;
		this.inputForeground = styles.inputForeground;
		this.inputBorder = styles.inputBorder;

		this.inputValidationInfoBackground = styles.inputValidationInfoBackground;
		this.inputValidationInfoBorder = styles.inputValidationInfoBorder;
		this.inputValidationWarningBackground = styles.inputValidationWarningBackground;
		this.inputValidationWarningBorder = styles.inputValidationWarningBorder;
		this.inputValidationErrorBackground = styles.inputValidationErrorBackground;
		this.inputValidationErrorBorder = styles.inputValidationErrorBorder;

		this.applyStyles();
	}

	protected applyStyles(): void {
		if (this.domNode) {
			const checkBoxStyles: ICheckboxStyles = {
				inputActiveOptionBorder: this.inputActiveOptionBorder,
			};
			this.regex.style(checkBoxStyles);
			this.wholeWords.style(checkBoxStyles);
			this.caseSensitive.style(checkBoxStyles);

			const inputBoxStyles: IInputBoxStyles = {
				inputBackground: this.inputBackground,
				inputForeground: this.inputForeground,
				inputBorder: this.inputBorder,
				inputValidationInfoBackground: this.inputValidationInfoBackground,
				inputValidationInfoBorder: this.inputValidationInfoBorder,
				inputValidationWarningBackground: this.inputValidationWarningBackground,
				inputValidationWarningBorder: this.inputValidationWarningBorder,
				inputValidationErrorBackground: this.inputValidationErrorBackground,
				inputValidationErrorBorder: this.inputValidationErrorBorder
			};
			this.inputBox.style(inputBoxStyles);
		}
	}

	public select(): void {
		this.inputBox.select();
	}

	public focus(): void {
		this.inputBox.focus();
	}

	public getCaseSensitive(): boolean {
		return this.caseSensitive.checked;
	}

	public setCaseSensitive(value: boolean): void {
		this.caseSensitive.checked = value;
		this.setInputWidth();
	}

	public getWholeWords(): boolean {
		return this.wholeWords.checked;
	}

	public setWholeWords(value: boolean): void {
		this.wholeWords.checked = value;
		this.setInputWidth();
	}

	public getRegex(): boolean {
		return this.regex.checked;
	}

	public setRegex(value: boolean): void {
		this.regex.checked = value;
		this.setInputWidth();
		this.validate();
	}

	public focusOnCaseSensitive(): void {
		this.caseSensitive.focus();
	}

	private _lastHighlightFindOptions: number = 0;
	public highlightFindOptions(): void {
		dom.removeClass(this.domNode, 'highlight-' + (this._lastHighlightFindOptions));
		this._lastHighlightFindOptions = 1 - this._lastHighlightFindOptions;
		dom.addClass(this.domNode, 'highlight-' + (this._lastHighlightFindOptions));
	}

	private setInputWidth(): void {
		let w = this.width - this.caseSensitive.width() - this.wholeWords.width() - this.regex.width();
		this.inputBox.width = w;
	}

	private buildDomNode(appendCaseSensitiveLabel: string, appendWholeWordsLabel: string, appendRegexLabel: string, history: string[]): void {
		this.domNode = document.createElement('div');
		this.domNode.style.width = this.width + 'px';
		dom.addClass(this.domNode, 'monaco-findInput');

		this.inputBox = this._register(new HistoryInputBox(this.domNode, this.contextViewProvider, {
			placeholder: this.placeholder || '',
			ariaLabel: this.label || '',
			validationOptions: {
				validation: this.validation || null
			},
			inputBackground: this.inputBackground,
			inputForeground: this.inputForeground,
			inputBorder: this.inputBorder,
			inputValidationInfoBackground: this.inputValidationInfoBackground,
			inputValidationInfoBorder: this.inputValidationInfoBorder,
			inputValidationWarningBackground: this.inputValidationWarningBackground,
			inputValidationWarningBorder: this.inputValidationWarningBorder,
			inputValidationErrorBackground: this.inputValidationErrorBackground,
			inputValidationErrorBorder: this.inputValidationErrorBorder,
			history
		}));

		this.regex = this._register(new RegexCheckbox({
			appendTitle: appendRegexLabel,
			isChecked: false,
			inputActiveOptionBorder: this.inputActiveOptionBorder
		}));
		this._register(this.regex.onChange(viaKeyboard => {
			this._onDidOptionChange.fire(viaKeyboard);
			if (!viaKeyboard) {
				this.inputBox.focus();
			}
			this.setInputWidth();
			this.validate();
		}));
		this._register(this.regex.onKeyDown(e => {
			this._onRegexKeyDown.fire(e);
		}));

		this.wholeWords = this._register(new WholeWordsCheckbox({
			appendTitle: appendWholeWordsLabel,
			isChecked: false,
			inputActiveOptionBorder: this.inputActiveOptionBorder
		}));
		this._register(this.wholeWords.onChange(viaKeyboard => {
			this._onDidOptionChange.fire(viaKeyboard);
			if (!viaKeyboard) {
				this.inputBox.focus();
			}
			this.setInputWidth();
			this.validate();
		}));

		this.caseSensitive = this._register(new CaseSensitiveCheckbox({
			appendTitle: appendCaseSensitiveLabel,
			isChecked: false,
			inputActiveOptionBorder: this.inputActiveOptionBorder
		}));
		this._register(this.caseSensitive.onChange(viaKeyboard => {
			this._onDidOptionChange.fire(viaKeyboard);
			if (!viaKeyboard) {
				this.inputBox.focus();
			}
			this.setInputWidth();
			this.validate();
		}));
		this._register(this.caseSensitive.onKeyDown(e => {
			this._onCaseSensitiveKeyDown.fire(e);
		}));

		// Arrow-Key support to navigate between options
		let indexes = [this.caseSensitive.domNode, this.wholeWords.domNode, this.regex.domNode];
		this.onkeydown(this.domNode, (event: IKeyboardEvent) => {
			if (event.equals(KeyCode.LeftArrow) || event.equals(KeyCode.RightArrow) || event.equals(KeyCode.Escape)) {
				let index = indexes.indexOf(<HTMLElement>document.activeElement);
				if (index >= 0) {
					let newIndex: number;
					if (event.equals(KeyCode.RightArrow)) {
						newIndex = (index + 1) % indexes.length;
					} else if (event.equals(KeyCode.LeftArrow)) {
						if (index === 0) {
							newIndex = indexes.length - 1;
						} else {
							newIndex = index - 1;
						}
					}

					if (event.equals(KeyCode.Escape)) {
						indexes[index].blur();
					} else if (newIndex >= 0) {
						indexes[newIndex].focus();
					}

					dom.EventHelper.stop(event, true);
				}
			}
		});

		this.setInputWidth();

		let controls = document.createElement('div');
		controls.className = 'controls';
		controls.appendChild(this.caseSensitive.domNode);
		controls.appendChild(this.wholeWords.domNode);
		controls.appendChild(this.regex.domNode);

		this.domNode.appendChild(controls);
	}

	public validate(): void {
		this.inputBox.validate();
	}

	public dispose(): void {
		super.dispose();
	}
}
