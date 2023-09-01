/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */
import {getFormatMessage} from "../../src/format/getFormatMessage";
import I18n from "../../src/core/I18n";

describe('getFormatMessage', () => {
    // Mocked i18nInstance object
    const i18nInstance = new I18n({
        messages: {
            en: {
                greeting: 'Hello, {name}!',
            },
        },
        locale: 'en',
        error: "missingMessage"
    });

    it('should return the correct translation for an existing message ID', () => {
        const id = 'greeting';
        const values = {name: 'John'};
        const expectedResult = 'Hello, John!';

        const result = getFormatMessage(i18nInstance, id, values);

        expect(result).toEqual(expectedResult);
    });

    it('should return the default message when the translation is missing', () => {
        const id = 'missingMessage';
        const expectedResult = 'missingMessage';

        const result = getFormatMessage(i18nInstance, id);

        expect(result).toEqual(expectedResult);
    });

});
