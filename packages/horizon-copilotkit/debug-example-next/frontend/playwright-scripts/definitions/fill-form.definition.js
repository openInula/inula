export const fillFormDefinition = {
  name: "fill-form",
  description: "自动填写用户信息表单。支持填写姓名、邮箱、年龄、国家、性别、优先级、技能、日期范围、个人简介等字段。",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "用户姓名"
      },
      email: {
        type: "string",
        description: "用户邮箱地址"
      },
      age: {
        type: "number",
        description: "用户年龄"
      },
      country: {
        type: "string",
        description: "用户所在国家",
        enum: ["中国", "美国", "日本", "德国", "法国", "英国"]
      },
      gender: {
        type: "string",
        description: "用户性别",
        enum: ["male", "female", "other"]
      },
      priority: {
        type: "string",
        description: "优先级设置",
        enum: ["low", "medium", "high"]
      },
      skills: {
        type: "array",
        description: "用户技能列表",
        items: {
          type: "string",
          enum: ["React", "TypeScript", "Node.js", "Python", "Java", "Go"]
        }
      },
      startDate: {
        type: "string",
        description: "开始日期 (YYYY-MM-DD格式)"
      },
      endDate: {
        type: "string",
        description: "结束日期 (YYYY-MM-DD格式)"
      },
      bio: {
        type: "string",
        description: "个人简介"
      },
      newsletter: {
        type: "boolean",
        description: "是否订阅通讯录"
      },
      submit: {
        type: "boolean",
        description: "是否自动提交表单",
        default: false
      }
    },
    required: []
  }
};