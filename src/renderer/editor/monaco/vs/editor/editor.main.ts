/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import './editor.all';
import './standalone/browser/accessibilityHelp/accessibilityHelp';
import './standalone/browser/inspectTokens/inspectTokens';
import './standalone/browser/iPadShowKeyboard/iPadShowKeyboard';
import './standalone/browser/quickOpen/quickOutline';
import './standalone/browser/quickOpen/gotoLine';
import './standalone/browser/quickOpen/quickCommand';
import './standalone/browser/toggleHighContrast/toggleHighContrast';
import './standalone/browser/referenceSearch/standaloneReferenceSearch';

import * as api from './editor.api';

import '../basic-language/markdown/markdown.contribution';

export const CancellationTokenSource = api.CancellationTokenSource;
export const Emitter = api.Emitter;
export const KeyCode = api.KeyCode;
export const KeyMod = api.KeyMod;
export const Position = api.Position;
export const Range = api.Range;
export const Selection = api.Selection;
export const SelectionDirection = api.SelectionDirection;
export const MarkerSeverity = api.MarkerSeverity;
export const MarkerTag = api.MarkerTag;
export const Promise = api.Promise;
export const Uri = api.Uri;
export const Token = api.Token;
export const editor = api.editor;
export const languages = api.languages;
