
import URI from '../../../base/common/uri';
import { createDecorator } from '../../../platform/instantiation/common/instantiation';
import { IPosition } from '../core/position';

export const ITextResourceConfigurationService = createDecorator<ITextResourceConfigurationService>('textResourceConfigurationService');

export interface ITextResourceConfigurationService {

	_serviceBrand: any;

	/**
	 * Fetches the value of the section for the given resource by applying language overrides.
	 * Value can be of native type or an object keyed off the section name.
	 *
	 * @param resource - Resource for which the configuration has to be fetched. Can be `null` or `undefined`.
	 * @param postion - Position in the resource for which configuration has to be fetched. Can be `null` or `undefined`.
	 * @param section - Section of the configuraion. Can be `null` or `undefined`.
	 *
	 */
	getValue<T>(resource: URI, section?: string): T;
	getValue<T>(resource: URI, position?: IPosition, section?: string): T;

}