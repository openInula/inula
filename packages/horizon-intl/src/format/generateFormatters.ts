/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */

import DateTimeFormatter from './fomatters/DateTimeFormatter';
import NumberFormatter from './fomatters/NumberFormatter';
import {DatePool, Locale, Locales, SelectPool} from '../types/types';
import PluralFormatter from './fomatters/PluralFormatter';
import SelectFormatter from './fomatters/SelectFormatter';
import {FormatOptions, IntlMessageFormat} from "../types/interfaces";

/**
 * 默认格式化接口
 */
const generateFormatters = (
    locale: Locale | Locales,
    locales: Locales,
    localeConfig: Record<string, any> = { plurals: undefined },
    formatOptions: FormatOptions = {}  // 自定义格式对象
): IntlMessageFormat => {
    locale = locales || locale;
    const { plurals } = localeConfig;
    /**
     *  样式函数 ，根据格式获取格式样式， 如货币百分比， 返回相应的格式的对象，如果没有设定格式，则返回一个空对象
     * @param formatOption
     */
    const getStyleOption = formatOption => {
        if (typeof formatOption === 'string') {
            return formatOptions[formatOption] || { option: formatOption };
        } else {
            return formatOption;
        }
    };

    return {
        // 复数规则
        plural: (value: number, { offset = 0, ...rules }, useMemorize?) => {
            const pluralFormatter = new PluralFormatter(
                locale,
                locales,
                value - offset,
                rules[value] || rules[(plurals as any)?.(value - offset)] || rules.other,
                useMemorize
            );
            return pluralFormatter.replaceSymbol.bind(pluralFormatter);
        },

        selectordinal: (value: number, { offset = 0, ...rules }, useMemorize?) => {
            const message = rules[value] || rules[(plurals as any)?.(value - offset, true)] || rules.other;
            const pluralFormatter = new PluralFormatter(locale, locales, value - offset, message, useMemorize);
            return pluralFormatter.replaceSymbol.bind(pluralFormatter);
        },

        // 选择规则，如果规则对象中包含与该值相对应的属性，则返回该属性的值；否则，返回 "other" 属性的值。
        select: (value: SelectPool, formatRules, useMemorize?) => {
            const selectFormatter = new SelectFormatter(locale);
            return selectFormatter.getRule(value, formatRules, useMemorize);
        },

        // 用于将数字格式化为字符串，接受一个数字和一个格式化规则。它会根据规则返回格式化后的字符串。
        numberFormat: (value : number, formatOption, useMemorize) => {
            return new NumberFormatter(locales, getStyleOption(formatOption), useMemorize).numberFormat(value);
        },

        // 用于将日期格式化为字符串，接受一个日期对象和一个格式化规则。它会根据规则返回格式化后的字符串。
        /**
         * eg: { year: 'numeric', month: 'long', day: 'numeric' } 是一个用于指定DateTimeFormatter如何将日期对象转换为字符串的参数。
         *      \year: 'numeric' 表示年份的表示方式是数字形式（比如2023）。
         *       month: 'long' 表示月份的表示方式是全名（比如January）。
         *       day: 'numeric' 表示日期的表示方式是数字形式（比如1号）。
         * @param value
         * @param formatOption { year: 'numeric', month: 'long', day: 'numeric' }
         * @param useMemorize
         */
        dateTimeFormat: (value: DatePool, formatOption, useMemorize) => {
            return new DateTimeFormatter(locales, getStyleOption(formatOption), useMemorize).dateTimeFormat(value, formatOption);
        },

        // 用于处理未定义的值，接受一个值并直接返回它。
        undefined: value => value,
    };
};

export default generateFormatters;
