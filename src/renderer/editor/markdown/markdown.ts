/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import IRichLanguageConfiguration = monaco.languages.LanguageConfiguration;
import ILanguage = monaco.languages.IMonarchLanguage;

import { EventEmitter } from 'events';

export const LexingEvent = {
    processHeaderToken: 'markdown_header_token',
    processQouteToken: 'markdown_qoute_token',
    processListToken: 'markdown_list_token',
	processEnterCodeBlockToken: 'markdown_enter_code_block_token',
	processCodeBlockToken: 'mardown_code_block_token',
	processExitCodeBlockToken: 'markdown_exit_code_block_token',
	processCodeInlineToken: 'markdown_code_inline_token',
	processEmphasisToken: 'markdown_emphasis_token',
	processStrongToken: 'markdonw_strong_token',
	processLinkToken: 'markdown_link_token',
	processImageToken: 'markdown_image_token',
	processHorizontalToken: 'markdown_horizontal_token',
	processEscapeToken: 'markdown_escape_token',
	processHtmlBeginTagToken: 'markdown_html_begin_tag_token',
	processHtmlEmdTagToken: 'markdown_html_end_tag_token',
	processHtmlSelfCloseToken: 'markdown_html_self_close_token',
	processParagraphToken: 'markdown_paragraph_token',
};

class LexingListener extends EventEmitter {
    private event = new EventEmitter();

    public on(event: string | symbol, callback: (...args: any[]) => void): this {
        super.on(event, (...args: any[]) => {
            setImmediate(callback, args);
        });
        return this;
    }
}

export const lexingListener = new LexingListener();

const TOKEN_HEADER_LEAD = 'keyword';
const TOKEN_HEADER = 'keyword';
const TOKEN_EXT_HEADER = 'keyword';
const TOKEN_SEPARATOR = 'meta.separator';
const TOKEN_QUOTE = 'comment';
const TOKEN_LIST = 'keyword';
const TOKEN_BLOCK = 'string';
const TOKEN_BLOCK_CODE = 'variable.source';

const DELIM_ASSIGN = 'delimiter.html';
const ATTRIB_NAME = 'attribute.name.html';
const ATTRIB_VALUE = 'string.html';

function getTag(name: string) {
	return 'tag';
}

export const conf: IRichLanguageConfiguration = {
	comments: {
		blockComment: ['<!--', '-->',]
	},
	brackets: [
		['{', '}'],
		['[', ']'],
		['(', ')']
	],
	autoClosingPairs: [
		{ open: '{', close: '}' },
		{ open: '[', close: ']' },
		{ open: '(', close: ')' },
		{ open: '<', close: '>', notIn: ['string'] }
	],
	surroundingPairs: [
		{ open: '(', close: ')' },
		{ open: '[', close: ']' },
		{ open: '`', close: '`' },
	],
	folding: {
		markers: {
			start: new RegExp("^\\s*<!--\\s*#?region\\b.*-->"),
			end: new RegExp("^\\s*<!--\\s*#?endregion\\b.*-->")
		}
	}
};

export const language = <ILanguage>{
	defaultToken: '',
	defaultTokenListener: function(lineIndex: number, line: string) {
		lexingListener.emit(LexingEvent.processParagraphToken, line);
	},
	tokenPostfix: '.md',

	// escape codes
	control: /[\\`*_\[\]{}()#+\-\.!]/,
	noncontrol: /[^\\`*_\[\]{}()#+\-\.!]/,
	escapes: /\\(?:@control)/,

	// escape codes for javascript/CSS strings
	jsescapes: /\\(?:[btnfr\\"']|[0-7][0-7]?|[0-3][0-7]{2})/,

	// non matched elements
	empty: [
		'area', 'base', 'basefont', 'br', 'col', 'frame',
		'hr', 'img', 'input', 'isindex', 'link', 'meta', 'param'
	],

	tokenizer: {
		root: [

			// headers (with #)
			{
				regex: /^(\s{0,3})(#+)((?:[^\\#]|@escapes)+)((?:#+)?)/,
				action: ['white', TOKEN_HEADER_LEAD, TOKEN_HEADER, TOKEN_HEADER],
				listener: function(lineIndex: number, offset: number, matches: string[], line: string) {
					lexingListener.emit(LexingEvent.processHeaderToken, lineIndex, matches[2].length, matches[3]);
				}
			},

			// quote
			{
				regex: /^>+/,
				action: TOKEN_QUOTE,
				listener: function(lineIndex: number, offset: number, matches: string[], line: string) {
					let depth = matches[0].length;
					lexingListener.emit(LexingEvent.processQouteToken, lineIndex, depth, line.substr(depth));
				}
			},

			// list (starting with * or number)
			{
				regex: /^\s*([\*\-+:]|\d+\.)\s/,
				action: TOKEN_LIST,
				listener: function(lineIndex: number, offset: number, matches: string[], line: string) {
					lexingListener.emit(LexingEvent.processListToken, lineIndex, line.substr(matches[0].length));
				}
			},

			// github style code blocks (with backticks and language)
			{
				regex: /^\s*```\s*((?:\w|[\/\-#])+)\s*$/,
				action: { token: TOKEN_BLOCK, next: '@codeblockgh', nextEmbedded: '$1' },
				listener: function(lineIndex: number, offset: number, matches: string[], line: string) {
					lexingListener.emit(LexingEvent.processEnterCodeBlockToken, lineIndex, matches[1]);
				}
			},

			// markup within lines
			{ include: '@linecontent' },
		],

		// github style code blocks
		codeblockgh: [
			{
				regex: /```\s*$/,
				action: { token: TOKEN_BLOCK_CODE, next: '@pop', nextEmbedded: '@pop' },
				listener: function(lineIndex: number, offset: number, matches: string[], line: string) {
					lexingListener.emit(LexingEvent.processExitCodeBlockToken, lineIndex);
				}
			},
			{
				regex: /[^`]+/,
				action: TOKEN_BLOCK_CODE,
				listener: function(lineIndex: number, offset: number, matches: string[], line: string) {
					lexingListener.emit(LexingEvent.processCodeBlockToken, lineIndex, line);
				}
			}
		],

		linecontent: [

			// escapes
			{
				regex: /&\w+;/,
				action: 'string.escape'
			},
			{
				regex: /@escapes/,
				action: 'escape',
				listener: function(lineIndex: number, offset: number, matches: string[], line: string) {
					lexingListener.emit(LexingEvent.processEscapeToken, lineIndex, offset, matches[0].substr(1));
				}
			},

			// various markup
			{
				regex: /\b__([^\\_]|@escapes|_(?!_))+__\b/,
				action: 'strong',
				listener: function(lineIndex: number, offset: number, matches: string[], line: string) {
					lexingListener.emit(LexingEvent.processStrongToken, lineIndex, offset, matches[1]);
				}
			},
			{
				regex: /\*\*([^\\*]|@escapes|\*(?!\*))+\*\*/,
				action: 'strong',
				listener: function(lineIndex: number, offset: number, matches: string[], line: string) {
					lexingListener.emit(LexingEvent.processStrongToken, lineIndex, offset, matches[1]);
				}
			},
			{
				regex: /\b_([^_]+)_\b/,
				action: 'emphasis',
				listener: function(lineIndex: number, offset: number, matches: string[], line: string) {
					lexingListener.emit(LexingEvent.processEmphasisToken, lineIndex, offset, matches[1]);
				}
			},
			{
				regex: /\*([^\\*]|@escapes)+\*/,
				action: 'emphasis',
				listener: function(lineIndex: number, offset: number, matches: string[], line: string) {
					lexingListener.emit(LexingEvent.processEmphasisToken, lineIndex, offset, matches[1]);
				}
			},
			{
				regex: /`([^\\`]|@escapes)+`/,
				action: 'variable',
				listener: function(lineIndex: number, offset: number, matches: string[], line: string) {
					lexingListener.emit(LexingEvent.processCodeInlineToken, lineIndex, offset, matches[1]);
				}
			},

			{
				regex: /(\[)((?:[^\]\\]|@escapes)*)(\]\([^\)]+\))/,
				action: ['string.link', '', 'string.link'],
				listener: function(lineIndex: number, offset: number, matches: string[], line: string) {
					let url = matches[3].substring(2, matches[3].length - 2);
					lexingListener.emit(LexingEvent.processLinkToken, lineIndex, offset, matches[2], url);
				}
			},
			{
				regex: /(!\[)((?:[^\]\\]|@escapes)*)(\]\([^\)]+\))/,
				action: ['string.link', '', 'string.link'],
				listener: function(lineIndex: number, offset: number, matches: string[], line: string) {
					let url = matches[3].substring(2, matches[3].length - 2);
					lexingListener.emit(LexingEvent.processImageToken, lineIndex, offset, matches[2], url);
				}
			},

			// or html
			{ include: 'html' },
		],

		// Note: it is tempting to rather switch to the real HTML mode instead of building our own here
		// but currently there is a limitation in Monarch that prevents us from doing it: The opening
		// '<' would start the HTML mode, however there is no way to jump 1 character back to let the
		// HTML mode also tokenize the opening angle bracket. Thus, even though we could jump to HTML,
		// we cannot correctly tokenize it in that mode yet.
		html: [
			// html tags
			{
				regex: /<(\w+)\/>/,
				action: getTag('$1'),
				listener: function(lineIndex: number, offset: number, matches: string[], line: string) {
					lexingListener.emit(LexingEvent.processHtmlSelfCloseToken, lineIndex, line);
				}
			},
			{
				regex: /<(\w+)/,
				action: {
					cases: {
						'@empty': { token: getTag('$1'), next: '@tag.$1' },
						'@default': { token: getTag('$1'), next: '@tag.$1' }
					}
				},
				listener: function(lineIndex: number, offset: number, matches: string[], line: string) {
					lexingListener.emit(LexingEvent.processHtmlBeginTagToken, lineIndex, line);
				}
			},
			{
				regex: /<\/(\w+)\s*>/,
				action: { token: getTag('$1') },
				listener: function(lineIndex: number, offset: number, matches: string[], line: string) {
					lexingListener.emit(LexingEvent.processHtmlEmdTagToken, lineIndex, matches[0]);
				}
			},

			{
				regex: /<!--/,
				action: { token: 'comment', next: '@comment' }				
			},
		],

		comment: [
			{
				regex: /[^<\-]+/,
				action: 'comment.content'
			},
			{
				regex: /-->/,
				action: { token: 'comment', next: '@pop' }
			},
			{
				regex: /<!--/,
				action: 'comment.content.invalid'
			},
			{
				regex: /[<\-]/,
				action: 'comment.content'
			},
		],

		// Almost full HTML tag matching, complete with embedded scripts & styles
		tag: [
			{
				regex: /[ \t\r\n]+/,
				action: 'white'
			},
			{
				regex: /(type)(\s*=\s*)(")([^"]+)(")/,
				action: [ATTRIB_NAME, DELIM_ASSIGN, ATTRIB_VALUE,
					{ token: ATTRIB_VALUE, switchTo: '@tag.$S2.$4' },
					ATTRIB_VALUE]
			},
			{
				regex: /(type)(\s*=\s*)(')([^']+)(')/,
				action: [ATTRIB_NAME, DELIM_ASSIGN, ATTRIB_VALUE,
					{ token: ATTRIB_VALUE, switchTo: '@tag.$S2.$4' },
					ATTRIB_VALUE]
			},
			{
				regex: /(\w+)(\s*=\s*)("[^"]*"|'[^']*')/,
				action: [ATTRIB_NAME, DELIM_ASSIGN, ATTRIB_VALUE]
			},
			{
				regex: /\w+/,
				action: ATTRIB_NAME
			},
			{
				regex: /\/>/,
				action: { token: getTag('$S2'), next: '@pop' }
			},
			{
				regex: />/,
				action: {
					cases: {
						'$S2==style': { token: getTag('$S2'), switchTo: 'embeddedStyle', nextEmbedded: 'text/css' },
						'$S2==script': {
							cases: {
								'$S3': { token: getTag('$S2'), switchTo: 'embeddedScript', nextEmbedded: '$S3' },
								'@default': { token: getTag('$S2'), switchTo: 'embeddedScript', nextEmbedded: 'text/javascript' }
							}
						},
						'@default': { token: getTag('$S2'), next: '@pop' }
					}
				}
			},
		],

		embeddedStyle: [
			{
				regex: /[^<]+/,
				action: ''
			},
			{
				regex: /<\/style\s*>/,
				action: { token: '@rematch', next: '@pop', nextEmbedded: '@pop' }
			},
			{
				regex: /</,
				action: ''
			}
		],

		embeddedScript: [
			{
				regex: /[^<]+/,
				action: ''
			},
			{
				regex: /<\/script\s*>/,
				action: { token: '@rematch', next: '@pop', nextEmbedded: '@pop' }
			},
			{
				regex: /</,
				action: ''
			},
		],
	}
};
