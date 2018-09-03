/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import IRichLanguageConfiguration = monaco.languages.LanguageConfiguration;
import ILanguage = monaco.languages.IMonarchLanguage;

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
	Html,
}

type ContentOnlyListenter = (content: string) => void;

const tokenTypeListenerMap = [];

const headerListeners: ((content: string, level: 1|2|3|4|5|6) => void)[] = [];
tokenTypeListenerMap[TokenType.Header] = headerListeners;

function headerListener(matches: string[]) {
	console.log(`Header: ${matches[0]}`);
}

const quoteListeners: ContentOnlyListenter[] = [];
tokenTypeListenerMap[TokenType.Quote] = quoteListeners;

function quoteListener(matches: string[]) {
	console.log(`Qoute: ${matches[0]}`);
}

const listListeners: ContentOnlyListenter[] = [];
tokenTypeListenerMap[TokenType.List] = listListeners;

function listListener(matches: string[]) {
	console.log(`List: ${matches[0]}`);
}

const codeBlockListeners = [];
tokenTypeListenerMap[TokenType.CodeBlock] = codeBlockListeners;

function codeBlockListener(matches: string[]) {
	console.log(`Code Block: ${matches[0]}`);
}

const codeInlineListeners = [];
tokenTypeListenerMap[TokenType.CodeInline] = codeInlineListeners;

function codeInlineListener(matches: string[]) {
	console.log(`Code Inline: ${matches[0]}`);
}

const emphasisListeners = [];
tokenTypeListenerMap[TokenType.Emphasis] = emphasisListeners;

function emphasisListener(matches: string[]) {
	console.log(`Emphasis: ${matches[0]}`);
}

const strongListeners = [];
tokenTypeListenerMap[TokenType.Strong] = strongListeners;

function strongListener(matches: string[]) {
	console.log(`Strong: ${matches[0]}`);
}

const linkListeners = [];
tokenTypeListenerMap[TokenType.Link] = linkListeners;

function linkListener(matches: string[]) {
	console.log(`Link: ${matches[0]}`);
}

const imageListeners = [];
tokenTypeListenerMap[TokenType.Image] = imageListeners;

function imageListener(matches: string[]) {
	console.log(`Image: ${matches[0]}`);
}

const horizontalListeners = [];
tokenTypeListenerMap[TokenType.Horizontal] = horizontalListeners;

function horizontalListener(matches: string[]) {
	console.log(`Horizontal: ${matches[0]}`);
}

const escapeListeners = [];
tokenTypeListenerMap[TokenType.Escape] = escapeListeners

function escapeListener(matches: string[]) {
	console.log(`Escape: ${matches[0]}`);
}

const htmlListeners = [];
tokenTypeListenerMap[TokenType.Html] = htmlListeners;

function htmlListener(matches: string[]) {
	console.log(`Html: ${matches[0]}`);
}

function defaultTokenListener(matches: string[]) {
	console.log(`***: ${matches[0]}`);
}

export function addTokenListener(type: TokenType, listener: (...arg: any[]) => void) {
	tokenTypeListenerMap[type].push(listener);
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
	defaultTokenListener: defaultTokenListener,
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
				listener: headerListener
			},

			// headers (with =)
			{
				regex: /^\s*(=+|\-+)\s*$/,
				action: TOKEN_EXT_HEADER,
				listener: headerListener
			},

			// headers (with ***)
			{
				regex: /^\s*((\*[ ]?)+)\s*$/,
				action: TOKEN_SEPARATOR,
				listener: headerListener
			},

			// quote
			{
				regex: /^\s*>+/,
				action: TOKEN_QUOTE,
				listener: quoteListener
			},

			// list (starting with * or number)
			{
				regex: /^\s*([\*\-+:]|\d+\.)\s/,
				action: TOKEN_LIST,
				listener: listListener
			},

			// code block (4 spaces indent)
			{
				regex: /^(\t|[ ]{4})[^ ].*$/,
				action: TOKEN_BLOCK,
				listener: codeBlockListener
			},

			// code block (3 tilde)
			{
				regex: /^\s*~~~\s*((?:\w|[\/\-#])+)?\s*$/,
				action: { token: TOKEN_BLOCK, next: '@codeblock' },
				listener: codeBlockListener
			},

			// github style code blocks (with backticks and language)
			{
				regex: /^\s*```\s*((?:\w|[\/\-#])+)\s*$/,
				action: { token: TOKEN_BLOCK, next: '@codeblockgh', nextEmbedded: '$1' },
				listener: codeBlockListener
			},

			// github style code blocks (with backticks but no language)
			{
				regex: /^\s*```\s*$/,
				action: { token: TOKEN_BLOCK, next: '@codeblock' },
				listener: codeBlockListener
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
				action: 'escape',
				listener: escapeListener
			},

			// various markup
			{
				regex: /\b__([^\\_]|@escapes|_(?!_))+__\b/,
				action: 'strong',
				listener: strongListener
			},
			{
				regex: /\*\*([^\\*]|@escapes|\*(?!\*))+\*\*/,
				action: 'strong',
				listener: strongListener
			},
			{
				regex: /\b_[^_]+_\b/,
				action: 'emphasis',
				listener: emphasisListener
			},
			{
				regex: /\*([^\\*]|@escapes)+\*/,
				action: 'emphasis',
				listener: emphasisListener
			},
			{
				regex: /`([^\\`]|@escapes)+`/,
				action: 'variable',
				listener: codeInlineListener
			},

			// links
			{
				regex: /\{[^}]+\}/,
				action: 'string.target',
				listener: linkListener
			},
			{
				regex: /(!?\[)((?:[^\]\\]|@escapes)*)(\]\([^\)]+\))/,
				action: ['string.link', '', 'string.link'],
				listener: imageListener
			},
			{
				regex: /(!?\[)((?:[^\]\\]|@escapes)*)(\])/,
				action: 'string.link',
				listener: imageListener
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
				listener: htmlListener
			},
			{
				regex: /<(\w+)/,
				action: {
					cases: {
						'@empty': { token: getTag('$1'), next: '@tag.$1' },
						'@default': { token: getTag('$1'), next: '@tag.$1' }
					}
				},
				listener: htmlListener
			},
			{
				regex: /<\/(\w+)\s*>/,
				action: { token: getTag('$1') },
				listener: htmlListener
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
