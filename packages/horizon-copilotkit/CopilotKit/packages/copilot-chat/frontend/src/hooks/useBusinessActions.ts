import { useMemo } from 'react'
import { useCopilotAction, useCopilotScriptAction } from '@copilotkit/copilot-client'
import { scriptActions } from '../../playwright-scripts/index.js'

/**
 * 业务相关的 CopilotKit Actions
 * 在这里定义与业务项目相关的 AI 动作
 */
export function useBusinessActions() {
  // 注册前端 Action 来测试工具调用
  const notificationAction = useMemo(() => ({
    name: "showNotification",
    description: "显示前端通知消息",
    parameters: [
      {
        name: "message",
        description: "通知消息内容",
        type: "string",
        required: true,
      },
      {
        name: "type",
        description: "通知类型: success, error, warning, info",
        type: "string",
        required: false,
      },
    ],
    handler: async (args: any) => {
      const { message, type = "info" } = args;
      alert(`${type.toUpperCase()}: ${message}`);
      return `已显示通知: ${message}`;
    },
  }), []);

  // 菜单打开 Actions - 使用增强描述方案
  const menuActions = useMemo(() => [
    {
      name: "openMainMenu",
      description: "[Category: Menu] 打开主菜单，显示系统的主要功能导航选项",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Opening main menu");
        // 触发主菜单打开逻辑
        const mainMenuEvent = new CustomEvent('openMainMenu');
        window.dispatchEvent(mainMenuEvent);
        return "已打开主菜单";
      },
    },
    {
      name: "openUserMenu",
      description: "[Category: Menu] 打开用户菜单，显示用户配置文件、设置和账户选项",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Opening user menu");
        const userMenuEvent = new CustomEvent('openUserMenu');
        window.dispatchEvent(userMenuEvent);
        return "已打开用户菜单";
      },
    },
    {
      name: "openSettingsMenu",
      description: "[Category: Menu] [Dependencies: userMenu] 打开系统设置菜单，访问应用配置和偏好设置",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Opening settings menu");
        const settingsEvent = new CustomEvent('openSettingsMenu');
        window.dispatchEvent(settingsEvent);
        return "已打开设置菜单";
      },
    },
    {
      name: "openNotificationsMenu",
      description: "[Category: Menu] 打开通知菜单，查看系统消息、提醒和通知历史",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Opening notifications menu");
        const notificationsEvent = new CustomEvent('openNotificationsMenu');
        window.dispatchEvent(notificationsEvent);
        return "已打开通知菜单";
      },
    },
    {
      name: "openSearchMenu",
      description: "[Category: Menu] 打开搜索菜单，启用全局搜索功能和高级搜索选项",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Opening search menu");
        const searchEvent = new CustomEvent('openSearchMenu');
        window.dispatchEvent(searchEvent);
        return "已打开搜索菜单";
      },
    },
    {
      name: "openContextMenu",
      description: "[Category: Menu] 打开上下文菜单，显示当前页面或选中元素的相关操作",
      parameters: [
        {
          name: "element",
          description: "触发上下文菜单的元素标识符",
          type: "string",
          required: false,
        },
      ],
      handler: async (args: any) => {
        const { element = "current" } = args;
        console.log(`---------------------> Opening context menu for: ${element}`);
        const contextEvent = new CustomEvent('openContextMenu', { detail: { element } });
        window.dispatchEvent(contextEvent);
        return `已为 ${element} 打开上下文菜单`;
      },
    },
    {
      name: "openAdminMenu",
      description: "[Category: Menu] [Dependencies: openMainMenu] 打开管理员菜单，访问系统管理功能和高级配置选项",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Opening admin menu");
        const adminEvent = new CustomEvent('openAdminMenu');
        window.dispatchEvent(adminEvent);
        return "已打开管理员菜单";
      },
    },
    {
      name: "openHelpMenu",
      description: "[Category: Menu] 打开帮助菜单，提供用户指南、文档和支持选项",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Opening help menu");
        const helpEvent = new CustomEvent('openHelpMenu');
        window.dispatchEvent(helpEvent);
        return "已打开帮助菜单";
      },
    },
    {
      name: "openQuickActionsMenu",
      description: "[Category: Menu] 打开快速操作菜单，显示常用功能的快捷入口和工作流程",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Opening quick actions menu");
        const quickActionsEvent = new CustomEvent('openQuickActionsMenu');
        window.dispatchEvent(quickActionsEvent);
        return "已打开快速操作菜单";
      },
    },
    {
      name: "openWorkspaceMenu",
      description: "[Category: Menu] [Dependencies: mainMenu] 打开工作区菜单，管理项目、工作空间和协作环境",
      parameters: [
        {
          name: "workspaceId",
          description: "要打开的工作区ID",
          type: "string",
          required: false,
        },
      ],
      handler: async (args: any) => {
        const { workspaceId = "default" } = args;
        console.log(`---------------------> Opening workspace menu for: ${workspaceId}`);
        const workspaceEvent = new CustomEvent('openWorkspaceMenu', { detail: { workspaceId } });
        window.dispatchEvent(workspaceEvent);
        return `已打开工作区菜单: ${workspaceId}`;
      },
    },
  ], []);

  // 菜单内部操作 Actions - 依赖对应的菜单打开Actions
  const menuItemActions = useMemo(() => [
    // 主菜单相关操作
    {
      name: "navigateToHome",
      description: "[Category: Action] [Dependencies: openMainMenu] 导航到主页面，显示应用程序的欢迎页面和概览信息",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Navigating to home");
        const homeEvent = new CustomEvent('navigateToHome');
        window.dispatchEvent(homeEvent);
        return "已导航到主页";
      },
    },
    {
      name: "navigateToProjects",
      description: "[Category: Action] [Dependencies: openMainMenu] 导航到项目页面，显示用户的所有项目列表",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Navigating to projects");
        const projectsEvent = new CustomEvent('navigateToProjects');
        window.dispatchEvent(projectsEvent);
        return "已导航到项目页面";
      },
    },
    {
      name: "navigateToReports",
      description: "[Category: Action] [Dependencies: openMainMenu] 导航到报告页面，查看统计数据和分析报告",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Navigating to reports");
        const reportsEvent = new CustomEvent('navigateToReports');
        window.dispatchEvent(reportsEvent);
        return "已导航到报告页面";
      },
    },

    // 用户菜单相关操作
    {
      name: "editProfile",
      description: "[Category: Action] [Dependencies: openUserMenu] 编辑用户配置文件，修改个人信息和头像",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Opening profile editor");
        const editProfileEvent = new CustomEvent('editProfile');
        window.dispatchEvent(editProfileEvent);
        return "已打开个人资料编辑";
      },
    },
    {
      name: "changePassword",
      description: "[Category: Action] [Dependencies: openUserMenu] 更改用户密码，提升账户安全性",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Opening password change");
        const passwordEvent = new CustomEvent('changePassword');
        window.dispatchEvent(passwordEvent);
        return "已打开密码修改页面";
      },
    },
    {
      name: "logout",
      description: "[Category: Action] [Dependencies: openUserMenu] 安全退出登录，清除用户会话",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Logging out user");
        const logoutEvent = new CustomEvent('logout');
        window.dispatchEvent(logoutEvent);
        return "已安全退出登录";
      },
    },

    // 设置菜单相关操作
    {
      name: "changeTheme",
      description: "[Category: Action] [Dependencies: openSettingsMenu] 更改应用主题，切换深色/浅色模式",
      parameters: [
        {
          name: "theme",
          description: "主题类型: light, dark, auto",
          type: "string",
          required: false,
        },
      ],
      handler: async (args: any) => {
        const { theme = "auto" } = args;
        console.log(`---------------------> Changing theme to: ${theme}`);
        const themeEvent = new CustomEvent('changeTheme', { detail: { theme } });
        window.dispatchEvent(themeEvent);
        return `已切换到${theme}主题`;
      },
    },
    {
      name: "changeLanguage",
      description: "[Category: Action] [Dependencies: openSettingsMenu] 更改应用语言，设置界面显示语言",
      parameters: [
        {
          name: "language",
          description: "语言代码: zh-CN, en-US, ja-JP",
          type: "string",
          required: false,
        },
      ],
      handler: async (args: any) => {
        const { language = "zh-CN" } = args;
        console.log(`---------------------> Changing language to: ${language}`);
        const langEvent = new CustomEvent('changeLanguage', { detail: { language } });
        window.dispatchEvent(langEvent);
        return `已切换到${language}语言`;
      },
    },
    {
      name: "configureNotifications",
      description: "[Category: Action] [Dependencies: openSettingsMenu] 配置通知设置，管理推送和提醒偏好",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Opening notification config");
        const notifConfigEvent = new CustomEvent('configureNotifications');
        window.dispatchEvent(notifConfigEvent);
        return "已打开通知配置";
      },
    },

    // 通知菜单相关操作
    {
      name: "markAllAsRead",
      description: "[Category: Action] [Dependencies: openNotificationsMenu] 标记所有通知为已读状态",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Marking all notifications as read");
        const markReadEvent = new CustomEvent('markAllAsRead');
        window.dispatchEvent(markReadEvent);
        return "已标记所有通知为已读";
      },
    },
    {
      name: "clearNotifications",
      description: "[Category: Action] [Dependencies: openNotificationsMenu] 清除所有通知，清空通知历史",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Clearing all notifications");
        const clearEvent = new CustomEvent('clearNotifications');
        window.dispatchEvent(clearEvent);
        return "已清除所有通知";
      },
    },
    {
      name: "filterNotifications",
      description: "[Category: Action] [Dependencies: openNotificationsMenu] 按类型筛选通知，显示特定类型的消息",
      parameters: [
        {
          name: "type",
          description: "通知类型: system, user, warning, info",
          type: "string",
          required: false,
        },
      ],
      handler: async (args: any) => {
        const { type = "all" } = args;
        console.log(`---------------------> Filtering notifications by: ${type}`);
        const filterEvent = new CustomEvent('filterNotifications', { detail: { type } });
        window.dispatchEvent(filterEvent);
        return `已按${type}类型筛选通知`;
      },
    },

    // 搜索菜单相关操作
    {
      name: "performSearch",
      description: "[Category: Action] [Dependencies: openSearchMenu] 执行搜索操作，在系统中查找内容",
      parameters: [
        {
          name: "query",
          description: "搜索关键词",
          type: "string",
          required: true,
        },
        {
          name: "scope",
          description: "搜索范围: all, files, users, projects",
          type: "string",
          required: false,
        },
      ],
      handler: async (args: any) => {
        const { query, scope = "all" } = args;
        console.log(`---------------------> Performing search: ${query} in ${scope}`);
        const searchEvent = new CustomEvent('performSearch', { detail: { query, scope } });
        window.dispatchEvent(searchEvent);
        return `已搜索"${query}"在${scope}范围内`;
      },
    },
    {
      name: "saveSearch",
      description: "[Category: Action] [Dependencies: openSearchMenu] 保存搜索条件，创建搜索快捷方式",
      parameters: [
        {
          name: "name",
          description: "保存的搜索名称",
          type: "string",
          required: true,
        },
      ],
      handler: async (args: any) => {
        const { name } = args;
        console.log(`---------------------> Saving search as: ${name}`);
        const saveEvent = new CustomEvent('saveSearch', { detail: { name } });
        window.dispatchEvent(saveEvent);
        return `已保存搜索为"${name}"`;
      },
    },
    {
      name: "clearSearchHistory",
      description: "[Category: Action] [Dependencies: openSearchMenu] 清除搜索历史记录，删除之前的搜索记录",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Clearing search history");
        const clearHistoryEvent = new CustomEvent('clearSearchHistory');
        window.dispatchEvent(clearHistoryEvent);
        return "已清除搜索历史";
      },
    },

    // 上下文菜单相关操作
    {
      name: "copyElement",
      description: "[Category: Action] [Dependencies: openContextMenu] 复制选中的元素或内容到剪贴板",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Copying element");
        const copyEvent = new CustomEvent('copyElement');
        window.dispatchEvent(copyEvent);
        return "已复制元素";
      },
    },
    {
      name: "deleteElement",
      description: "[Category: Action] [Dependencies: openContextMenu] 删除选中的元素或内容",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Deleting element");
        const deleteEvent = new CustomEvent('deleteElement');
        window.dispatchEvent(deleteEvent);
        return "已删除元素";
      },
    },
    {
      name: "shareElement",
      description: "[Category: Action] [Dependencies: openContextMenu] 分享选中的元素或内容给其他用户",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Sharing element");
        const shareEvent = new CustomEvent('shareElement');
        window.dispatchEvent(shareEvent);
        return "已开始分享元素";
      },
    },

    // 管理员菜单相关操作
    {
      name: "manageUsers",
      description: "[Category: Action] [Dependencies: openAdminMenu] 管理用户，可以为用户添加、删除或修改权限",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Opening user management");
        const userMgmtEvent = new CustomEvent('manageUsers');
        window.dispatchEvent(userMgmtEvent);
        return "已打开用户管理";
      },
    },
    {
      name: "viewSystemLogs",
      description: "[Category: Action] [Dependencies: openAdminMenu] 查看系统日志，监控系统运行状态",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Opening system logs");
        const logsEvent = new CustomEvent('viewSystemLogs');
        window.dispatchEvent(logsEvent);
        return "已打开系统日志";
      },
    },
    {
      name: "configureSystem",
      description: "[Category: Action] [Dependencies: openAdminMenu] 配置系统设置，修改高级系统参数",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Opening system config");
        const sysConfigEvent = new CustomEvent('configureSystem');
        window.dispatchEvent(sysConfigEvent);
        return "已打开系统配置";
      },
    },

    // 帮助菜单相关操作
    {
      name: "openUserGuide",
      description: "[Category: Action] [Dependencies: openHelpMenu] 打开用户指南，查看详细的使用说明",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Opening user guide");
        const guideEvent = new CustomEvent('openUserGuide');
        window.dispatchEvent(guideEvent);
        return "已打开用户指南";
      },
    },
    {
      name: "contactSupport",
      description: "[Category: Action] [Dependencies: openHelpMenu] 联系技术支持，提交问题或获取帮助",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Opening support contact");
        const supportEvent = new CustomEvent('contactSupport');
        window.dispatchEvent(supportEvent);
        return "已打开技术支持联系方式";
      },
    },
    {
      name: "checkUpdates",
      description: "[Category: Action] [Dependencies: openHelpMenu] 检查系统更新，查看是否有新版本可用",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Checking for updates");
        const updateEvent = new CustomEvent('checkUpdates');
        window.dispatchEvent(updateEvent);
        return "已检查系统更新";
      },
    },

    // 快速操作菜单相关操作
    {
      name: "createNewProject",
      description: "[Category: Action] [Dependencies: openQuickActionsMenu] 创建新项目，快速开始新的工作项目",
      parameters: [
        {
          name: "projectName",
          description: "项目名称",
          type: "string",
          required: false,
        },
      ],
      handler: async (args: any) => {
        const { projectName = "新项目" } = args;
        console.log(`---------------------> Creating new project: ${projectName}`);
        const createEvent = new CustomEvent('createNewProject', { detail: { projectName } });
        window.dispatchEvent(createEvent);
        return `已创建新项目"${projectName}"`;
      },
    },
    {
      name: "uploadFile",
      description: "[Category: Action] [Dependencies: openQuickActionsMenu] 上传文件，快速添加文档或媒体文件",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Opening file upload");
        const uploadEvent = new CustomEvent('uploadFile');
        window.dispatchEvent(uploadEvent);
        return "已打开文件上传";
      },
    },
    {
      name: "exportData",
      description: "[Category: Action] [Dependencies: openQuickActionsMenu] 导出数据，将当前数据导出为文件",
      parameters: [
        {
          name: "format",
          description: "导出格式: xlsx, csv, pdf, json",
          type: "string",
          required: false,
        },
      ],
      handler: async (args: any) => {
        const { format = "xlsx" } = args;
        console.log(`---------------------> Exporting data as: ${format}`);
        const exportEvent = new CustomEvent('exportData', { detail: { format } });
        window.dispatchEvent(exportEvent);
        return `已导出数据为${format}格式`;
      },
    },

    // 工作区菜单相关操作
    {
      name: "switchWorkspace",
      description: "[Category: Action] [Dependencies: openWorkspaceMenu] 切换工作区，在不同的工作环境间切换",
      parameters: [
        {
          name: "workspaceId",
          description: "目标工作区ID",
          type: "string",
          required: true,
        },
      ],
      handler: async (args: any) => {
        const { workspaceId } = args;
        console.log(`---------------------> Switching to workspace: ${workspaceId}`);
        const switchEvent = new CustomEvent('switchWorkspace', { detail: { workspaceId } });
        window.dispatchEvent(switchEvent);
        return `已切换到工作区"${workspaceId}"`;
      },
    },
    {
      name: "shareWorkspace",
      description: "[Category: Action] [Dependencies: openWorkspaceMenu] 分享工作区，邀请其他用户协作",
      parameters: [
        {
          name: "email",
          description: "邀请用户的邮箱地址",
          type: "string",
          required: false,
        },
      ],
      handler: async (args: any) => {
        const { email = "" } = args;
        console.log(`---------------------> Sharing workspace with: ${email || "users"}`);
        const shareWsEvent = new CustomEvent('shareWorkspace', { detail: { email } });
        window.dispatchEvent(shareWsEvent);
        return `已分享工作区${email ? `给${email}` : ""}`;
      },
    },
    {
      name: "manageWorkspaceSettings",
      description: "[Category: Action] [Dependencies: openWorkspaceMenu] 管理工作区设置，配置工作区权限和参数",
      parameters: [],
      handler: async () => {
        console.log("---------------------> Opening workspace settings");
        const wsSettingsEvent = new CustomEvent('manageWorkspaceSettings');
        window.dispatchEvent(wsSettingsEvent);
        return "已打开工作区设置";
      },
    },
  ], []);

  // // 注册所有 Actions
  // useCopilotAction(notificationAction);

  // // 注册所有菜单 Actions
  // menuActions.forEach(action => {
  //   useCopilotAction(action);
  // });

  // // 注册所有菜单内部操作 Actions
  // menuItemActions.forEach(action => {
  //   useCopilotAction(action);
  // });

  // 测试函数间数据传递的 Actions
  const dataFlowTestActions = useMemo(() => [
    // 第一步：创建用户会话
    {
      name: "createUserSession",
      description: "[Category: DataFlow] 创建用户会话，返回会话ID和用户信息，供后续操作使用",
      parameters: [
        {
          name: "username",
          description: "用户名",
          type: "string",
          required: true,
        },
        {
          name: "email",
          description: "用户邮箱",
          type: "string",
          required: false,
        },
      ],
      handler: async (args: any) => {
        const { username, email = `${username}@example.com` } = args;
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const userInfo = {
          id: `user_${Math.random().toString(36).substr(2, 9)}`,
          username,
          email,
          createdAt: new Date().toISOString(),
        };
        
        console.log(`---------------------> Creating user session for: ${username}`);
        
        // 返回结构化数据供其他函数使用
        return {
          success: true,
          sessionId,
          userInfo,
          message: `已为用户 ${username} 创建会话 ${sessionId}`,
        };
      },
    },

    // 第二步：获取用户权限（依赖会话信息）
    {
      name: "getUserPermissions",
      description: "[Category: DataFlow] [Dependencies: createUserSession] 根据用户会话信息获取用户权限列表",
      parameters: [
        {
          name: "sessionData",
          description: "来自 createUserSession 的会话数据，包含 sessionId 和 userInfo",
          type: "object",
          required: true,
        },
      ],
      handler: async (args: any) => {
        const { sessionData } = args;
        
        if (!sessionData || !sessionData.sessionId || !sessionData.userInfo) {
          return {
            success: false,
            error: "缺少有效的会话数据，请先调用 createUserSession",
          };
        }

        const permissions = [
          "read_projects",
          "write_projects",
          sessionData.userInfo.username.includes("admin") ? "admin_access" : "user_access",
          "create_reports",
        ];

        console.log(`---------------------> Getting permissions for session: ${sessionData.sessionId}`);

        return {
          success: true,
          sessionId: sessionData.sessionId,
          userInfo: sessionData.userInfo,
          permissions,
          message: `已获取用户 ${sessionData.userInfo.username} 的权限: ${permissions.join(", ")}`,
        };
      },
    },

    // 第三步：创建项目（依赖用户权限）
    {
      name: "createProject",
      description: "[Category: DataFlow] [Dependencies: getUserPermissions] 根据用户权限创建新项目",
      parameters: [
        {
          name: "permissionData",
          description: "来自 getUserPermissions 的权限数据，包含用户信息和权限列表",
          type: "object",
          required: true,
        },
        {
          name: "projectName",
          description: "项目名称",
          type: "string",
          required: true,
        },
        {
          name: "projectType",
          description: "项目类型: web, mobile, desktop, api",
          type: "string",
          required: false,
        },
      ],
      handler: async (args: any) => {
        const { permissionData, projectName, projectType = "web" } = args;

        if (!permissionData || !permissionData.permissions) {
          return {
            success: false,
            error: "缺少权限数据，请先调用 getUserPermissions",
          };
        }

        if (!permissionData.permissions.includes("write_projects")) {
          return {
            success: false,
            error: `用户 ${permissionData.userInfo.username} 没有创建项目的权限`,
          };
        }

        const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const project = {
          id: projectId,
          name: projectName,
          type: projectType,
          ownerId: permissionData.userInfo.id,
          ownerName: permissionData.userInfo.username,
          createdAt: new Date().toISOString(),
          status: "active",
        };

        console.log(`---------------------> Creating project: ${projectName} for user: ${permissionData.userInfo.username}`);

        return {
          success: true,
          project,
          sessionData: permissionData,
          message: `已为用户 ${permissionData.userInfo.username} 创建项目"${projectName}"`,
        };
      },
    },

    // 第四步：生成项目报告（依赖项目信息）
    {
      name: "generateProjectReport",
      description: "[Category: DataFlow] [Dependencies: createProject] 为指定项目生成详细报告",
      parameters: [
        {
          name: "projectData",
          description: "来自 createProject 的项目数据",
          type: "object",
          required: true,
        },
        {
          name: "reportType",
          description: "报告类型: summary, detailed, analytics",
          type: "string",
          required: false,
        },
      ],
      handler: async (args: any) => {
        const { projectData, reportType = "summary" } = args;

        if (!projectData || !projectData.project) {
          return {
            success: false,
            error: "缺少项目数据，请先调用 createProject",
          };
        }

        if (!projectData.sessionData.permissions.includes("create_reports")) {
          return {
            success: false,
            error: `用户 ${projectData.sessionData.userInfo.username} 没有生成报告的权限`,
          };
        }

        const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const report = {
          id: reportId,
          projectId: projectData.project.id,
          projectName: projectData.project.name,
          type: reportType,
          generatedBy: projectData.sessionData.userInfo.username,
          generatedAt: new Date().toISOString(),
          content: {
            summary: `项目 "${projectData.project.name}" 的${reportType}报告`,
            details: {
              projectType: projectData.project.type,
              owner: projectData.project.ownerName,
              createdDate: projectData.project.createdAt,
              status: projectData.project.status,
            },
          },
        };

        console.log(`---------------------> Generating ${reportType} report for project: ${projectData.project.name}`);

        return {
          success: true,
          report,
          projectData,
          message: `已为项目"${projectData.project.name}"生成${reportType}报告`,
        };
      },
    },

    // 第五步：发送报告通知（依赖报告信息）
    {
      name: "sendReportNotification",
      description: "[Category: DataFlow] [Dependencies: generateProjectReport] 向相关用户发送报告生成通知",
      parameters: [
        {
          name: "reportData",
          description: "来自 generateProjectReport 的报告数据",
          type: "object",
          required: true,
        },
        {
          name: "notificationMethod",
          description: "通知方式: email, sms, system",
          type: "string",
          required: false,
        },
      ],
      handler: async (args: any) => {
        const { reportData, notificationMethod = "system" } = args;

        if (!reportData || !reportData.report) {
          return {
            success: false,
            error: "缺少报告数据，请先调用 generateProjectReport",
          };
        }

        const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const notification = {
          id: notificationId,
          reportId: reportData.report.id,
          recipient: reportData.projectData.sessionData.userInfo,
          method: notificationMethod,
          subject: `项目报告已生成: ${reportData.projectData.project.name}`,
          message: `您的项目"${reportData.projectData.project.name}"的${reportData.report.type}报告已生成完成`,
          sentAt: new Date().toISOString(),
        };

        console.log(`---------------------> Sending ${notificationMethod} notification for report: ${reportData.report.id}`);

        return {
          success: true,
          notification,
          fullWorkflowData: {
            session: reportData.projectData.sessionData,
            project: reportData.projectData.project,
            report: reportData.report,
            notification,
          },
          message: `已通过${notificationMethod}向用户 ${reportData.projectData.sessionData.userInfo.username} 发送报告通知`,
        };
      },
    },
  ], []);

  scriptActions.forEach(action => {
    useCopilotScriptAction(action);
  });

  // 注册数据流测试 Actions
  dataFlowTestActions.forEach(action => {
    useCopilotAction(action);
  });
}