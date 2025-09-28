export const alarmSearchDefinition = {
    name: "alarm-search",
    description: "统一的告警查询函数，支持多种过滤条件组合查询，包括告警发生时间、告警级别、告警状态、告警源、告警名称等条件。",
    parameters: {
        type: "object",
        properties: {
            // 时间范围过滤
            timeFilter: {
                type: "object",
                description: "时间过滤条件",
                properties: {
                    type: {
                        type: "string",
                        enum: ["range", "last"],
                        description: "时间过滤类型：range-时间范围，last-最近时间"
                    },
                    // 时间范围查询
                    startTime: {
                        type: "string",
                        description: "开始时间，格式：YYYY-MM-DD HH:mm:ss",
                        pattern: "^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$"
                    },
                    endTime: {
                        type: "string",
                        description: "结束时间，格式：YYYY-MM-DD HH:mm:ss",
                        pattern: "^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$"
                    },
                    // 最近时间查询
                    value: {
                        type: "number",
                        description: "时间数值（如3表示最近3个单位时间）",
                        minimum: 1,
                        maximum: 9999
                    },
                    unit: {
                        type: "string",
                        description: "时间单位",
                        enum: ["day", "hour", "minute"],
                        default: "hour"
                    }
                },
                additionalProperties: false
            },
            // 告警级别过滤
            levels: {
                type: "array",
                description: "告警级别列表",
                items: {
                    type: "string",
                    enum: ["critical", "major", "minor", "warning"]
                },
                minItems: 1,
                uniqueItems: true
            },
            // 告警状态过滤
            statusFilter: {
                type: "object",
                description: "告警状态过滤条件",
                properties: {
                    acknowledged: {
                        type: "boolean",
                        description: "是否包括已确认的告警"
                    },
                    cleared: {
                        type: "boolean",
                        description: "是否包括已清除的告警"
                    },
                    unacknowledged: {
                        type: "boolean",
                        description: "是否包括未确认的告警"
                    },
                    uncleared: {
                        type: "boolean",
                        description: "是否包括未清除的告警"
                    }
                },
                additionalProperties: false
            },
            // 告警源过滤
            sourceName: {
                type: "string",
                description: "告警源名称或IP地址关键词"
            },
            // 告警名称过滤
            alarmName: {
                type: "string",
                description: "告警名称关键词，如'内核'、'CPU'、'内存'等"
            },
            // 自动确认执行
            autoConfirm: {
                type: "boolean",
                description: "是否自动确认并执行查询",
                default: true
            }
        },
        required: [],
        additionalProperties: false
    }
};