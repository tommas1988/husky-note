/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as nls from '../../../nls';
import { KeyCode, KeyMod } from '../../../base/common/keyCodes';
import { registerEditorAction, ServicesAccessor, EditorAction } from '../../browser/editorExtensions';
import { TabFocus } from '../../common/config/commonEditorConfig';
import { ICodeEditor } from '../../browser/editorBrowser';
import { KeybindingWeight } from '../../../platform/keybinding/common/keybindingsRegistry';

export class ToggleTabFocusModeAction extends EditorAction {

	public static readonly ID = 'editor.action.toggleTabFocusMode';

	constructor() {
		super({
			id: ToggleTabFocusModeAction.ID,
			label: nls.localize({ key: 'toggle.tabMovesFocus', comment: ['Turn on/off use of tab key for moving focus around VS Code'] }, "Toggle Tab Key Moves Focus"),
			alias: 'Toggle Tab Key Moves Focus',
			precondition: null,
			kbOpts: {
				kbExpr: null,
				primary: KeyMod.CtrlCmd | KeyCode.KEY_M,
				mac: { primary: KeyMod.WinCtrl | KeyMod.Shift | KeyCode.KEY_M },
				weight: KeybindingWeight.EditorContrib
			}
		});
	}

	public run(accessor: ServicesAccessor, editor: ICodeEditor): void {
		let oldValue = TabFocus.getTabFocusMode();
		TabFocus.setTabFocusMode(!oldValue);
	}
}

registerEditorAction(ToggleTabFocusModeAction);
