/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import IRichLanguageConfiguration = monaco.languages.LanguageConfiguration;
import ILanguage = monaco.languages.IMonarchLanguage;

const headerListeners: ((content: string) => void)[] = [];
const quoteListeners = [];
const listListeners = [];
const codeBlockListeners = [];
const codeInlineListeners = [];
const emphasisListeners = [];
const strongListeners = [];
const linkListeners = [];
const imageListeners = [];
const horizontalListeners = [];
const escapeListeners = [];

export enum TokenType {
	Header,
	Quote,
	List,
	CodeBlock,
	CodeInline,
	Emphasis,
	Strong,
	Link,
	Image,
	Horizontal,
	Escape,
}

export function addTokenListener(type: TokenType, listener: (...arg: any[]) => void) {
	switch (type) {
		case TokenType.Header:
			headerListeners.push(listener);
			break;
		case TokenType.Quote:
			quoteListeners.push(listener);
			break;
		case TokenType.List:
			listListeners.push(listener);
			break;
		case TokenType.CodeBlock:
			codeBlockListeners.push(listener);
			break;
		case TokenType.CodeInline:
			codeInlineListeners.push(listener);
			break;
		case TokenType.Emphasis:
			emphasisListeners.push(listener);
			break;
		case TokenType.Strong:
			strongListeners.push(listener);
			break;
		case TokenType.Link:
			linkListeners.push(listener);
			break;
		case TokenType.Image:
			imageListeners.push(listener);
			break;
		case TokenType.Horizontal:
			horizontalListeners.push(listener);
			break;
		case TokenType.Escape:
			escapeListeners.push(listener);
			break;
	}
}

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
				action: ['white', TOKEN_HEADER_LEAD, TOKEN_HEADER, TOKEN_HEADER]
			},

			// headers (with =)
			{
				regex: /^\s*(=+|\-+)\s*$/,
				action: TOKEN_EXT_HEADER
			},

			// headers (with ***)
			{
				regex: /^\s*((\*[ ]?)+)\s*$/,
				action: TOKEN_SEPARATOR
			},

			// quote
			{
				regex: /^\s*>+/,
				action: TOKEN_QUOTE
			},

			// list (starting with * or number)
			{
				regex: /^\s*([\*\-+:]|\d+\.)\s/,
				action: TOKEN_LIST
			},

			// code block (4 spaces indent)
			{
				regex: /^(\t|[ ]{4})[^ ].*$/,
				action: TOKEN_BLOCK
			},

			// code block (3 tilde)
			{
				regex: /^\s*~~~\s*((?:\w|[\/\-#])+)?\s*$/,
				action: { token: TOKEN_BLOCK, next: '@codeblock' }
			},

			// github style code blocks (with backticks and language)
			{
				regex: /^\s*```\s*((?:\w|[\/\-#])+)\s*$/,
				action: { token: TOKEN_BLOCK, next: '@codeblockgh', nextEmbedded: '$1' }
			},

			// github style code blocks (with backticks but no language)
			{
				regex: /^\s*```\s*$/,
				action: { token: TOKEN_BLOCK, next: '@codeblock' }
			},

			// markup within lines
			{ include: '@linecontent' },
		],

		codeblock: [
			{
				regex: /^\s*~~~\s*$/,
				action: { token: TOKEN_BLOCK, next: '@pop' }
			},
			{
				regex: /^\s*```\s*$/,
				action: { token: TOKEN_BLOCK, next: '@pop' }
			},
			{
				regex: /.*$/,
				action: TOKEN_BLOCK_CODE
			},
		],

		// github style code blocks
		codeblockgh: [
			{
				regex: /```\s*$/,
				action: { token: TOKEN_BLOCK_CODE, next: '@pop', nextEmbedded: '@pop' }
			},
			{
				regex: /[^`]+/,
				action: TOKEN_BLOCK_CODE
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
				action: 'escape'
			},

			// various markup
			{
				regex: /\b__([^\\_]|@escapes|_(?!_))+__\b/,
				action: 'strong'
			},
			{
				regex: /\*\*([^\\*]|@escapes|\*(?!\*))+\*\*/,
				action: 'strong'
			},
			{
				regex: /\b_[^_]+_\b/,
				action: 'emphasis'
			},
			{
				regex: /\*([^\\*]|@escapes)+\*/,
				action: 'emphasis'
			},
			{
				regex: /`([^\\`]|@escapes)+`/,
				action: 'variable'
			},

			// links
			{
				regex: /\{[^}]+\}/,
				action: 'string.target'
			},
			{
				regex: /(!?\[)((?:[^\]\\]|@escapes)*)(\]\([^\)]+\))/,
				action: ['string.link', '', 'string.link']
			},
			{
				regex: /(!?\[)((?:[^\]\\]|@escapes)*)(\])/,
				action: 'string.link'
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
				action: getTag('$1')
			},
			{
				regex: /<(\w+)/,
				action: {
					cases: {
						'@empty': { token: getTag('$1'), next: '@tag.$1' },
						'@default': { token: getTag('$1'), next: '@tag.$1' }
					}
				}
			},
			{
				regex: /<\/(\w+)\s*>/,
				action: { token: getTag('$1') }
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
