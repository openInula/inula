import { Page, ElementHandle } from 'playwright';
import * as cheerio from 'cheerio';

// Type aliases for better compatibility
type CheerioInstance = ReturnType<typeof cheerio.load>;
type CheerioElement = any;
import { PageAnalysis, PageContent, FormInfo, TableInfo, ButtonInfo, LinkInfo, ImageInfo, PageMetadata, MenuItem, WindowContent } from '../types';
import { Logger } from '../utils/Logger';
import { LLMAnalyzer, ImageAnalysisConfig, ImageAnalysisResult } from '../llm/LLMAnalyzer';
import * as fs from 'fs/promises';


export class PageAnalyzer {
  private page: Page;
  private logger: Logger;
  private llmAnalyzer?: LLMAnalyzer;

  constructor(
    page: Page,
    logger: Logger,
    llmAnalyzer?: LLMAnalyzer,
    private onMenuOpen?: (page: Page, emit: string[], menuItem: MenuItem) => Promise<void>,
    private onExtractContent?: (page: Page, menuItem: MenuItem) => Promise<WindowContent>,
    private onMenuClose?: (page: Page) => Promise<void>,
  ) {
    this.page = page;
    this.logger = logger;
    this.llmAnalyzer = llmAnalyzer;
  }

  async analyzeImageWithLLM(imagePath: string, config: ImageAnalysisConfig): Promise<ImageAnalysisResult | null> {
    if (!this.llmAnalyzer) {
      this.logger.warn('LLMAnalyzer not provided, skipping image analysis');
      return null;
    }

    try {
      return await this.llmAnalyzer.analyzeImage(imagePath, config);
    } catch (error) {
      this.logger.error(`Failed to analyze image with LLM: ${imagePath}`, error);
      return null;
    }
  }

  async analyzePage(menuItem: MenuItem, menuPath: string[]): Promise<PageAnalysis> {
    this.logger.info(`Analyzing page: ${menuItem.text} ${menuItem.url ? `(${menuItem.url})` : '(function-based)'}`);

    try {
      // Navigate to the page using URL or function call
      if (menuItem.emit && menuItem.emit.length && this.onMenuOpen) {
        // Function-based navigation
        this.logger.info(`Opening page via function with emit: ${menuItem.emit.join(', ')}`);
        await this.onMenuOpen(this.page, menuItem.emit, menuItem);

        // Wait for the page to load after function call
        await this.page.waitForTimeout(3000);
      } else if (menuItem.url) {
        // Traditional URL-based navigation
        await this.page.goto(menuItem.url, { waitUntil: 'networkidle' });
        await this.page.waitForTimeout(3000);
      } else if (menuItem.href) {
        // Navigate using href path
        const currentUrl = this.page.url();
        const baseUrl = new URL(currentUrl).origin;
        const fullUrl = `${baseUrl}${menuItem.href}`;
        
        await this.page.goto(fullUrl, { waitUntil: 'networkidle' });
        await this.page.waitForTimeout(3000);
      } else {
        throw new Error(`MenuItem ${menuItem.text} has neither URL nor emit actions`);
      }

      // Extract page content using custom callback or default method
      let windowContent: WindowContent;
      if (menuItem.emit && menuItem.emit.length && this.onExtractContent) {
        // Use custom content extraction provided by user
        windowContent = await this.onExtractContent(this.page, menuItem);
      } else {
        // Fallback to default page content extraction
        windowContent = await this.extractDefaultContent();
      }

      // 根据 WindowContent 的 type 决定分析方式
      let content: PageContent;

      if (windowContent.type === 'screenshot') {
        this.logger.info('Using canvas-based analysis');
        content = await this.analyzeCanvasContent(windowContent);
      } else {
        this.logger.info('Using HTML content extraction');
        content = await this.extractPageContent(windowContent.html, windowContent.url);
      }

      if (menuItem.emit && menuItem.emit.length && this.onMenuClose) {
        await this.onMenuClose(this.page);
      }

      return {
        url: windowContent.url,
        title: windowContent.title,
        menuPath,
        content,
        timestamp: new Date()
      };

    } catch (error) {
      this.logger.error(`Failed to analyze page ${menuItem.text}:`, error);
      throw error;
    }
  }

  private async extractDefaultContent(): Promise<WindowContent> {
    // Default content extraction - just get current page content
    const html = await this.page.content();
    const title = await this.page.title();
    const url = this.page.url();

    return {
      html,
      title,
      url,
      type: 'html'
    };
  }

  private async analyzeCanvasContent(windowContent: WindowContent): Promise<PageContent> {
    this.logger.info('Analyzing canvas content');

    // 基础内容结构
    const content: PageContent = {
      html: windowContent.html,
      text: 'Canvas-based content analysis',
      forms: [],
      tables: [],
      buttons: [],
      links: [],
      metadata: {
        description: 'Canvas-based page content',
        breadcrumbs: [],
        pageType: 'canvas'
      }
    };

    // 如果有 LLM 分析器且提供了 canvas 对象，进行 AI 分析
    if (this.llmAnalyzer && windowContent.dataURL) {
      try {
        // 创建临时图片文件用于分析
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const tempImagePath = `./screenshots/temp-${windowContent.title}-${timestamp}.png`;

        // 将 dataURL 转换为文件
        const base64Data = windowContent.dataURL.replace(/^data:image\/png;base64,/, '');
        await fs.writeFile(tempImagePath, base64Data, 'base64');

        const imageAnalysisConfig: ImageAnalysisConfig = {};
        
        const analysisResult = await this.llmAnalyzer.analyzeImage(tempImagePath, imageAnalysisConfig);

        if (analysisResult) {
          content.text = analysisResult.analysis || 'Canvas content analyzed via AI';
          if (analysisResult.visualElements) {
            content.metadata.visualElements = analysisResult.visualElements;
          }
        }

        // 清理临时文件
        // try {
        //   await fs.unlink(tempImagePath);
        // } catch (error) {
        //   this.logger.warn(`Failed to cleanup temp file: ${tempImagePath}`);
        // }

      } catch (error) {
        this.logger.error('Failed to analyze canvas with LLM:', error);
      }
    }

    return content;
  }


  private async extractPageContent(html: string, url: string): Promise<PageContent> {
    const $ = cheerio.load(html);

    // Remove script and style tags for cleaner text extraction
    $('script, style, nav, footer, .sidebar, .menu').remove();

    const content: PageContent = {
      html,
      text: this.extractCleanText($),
      forms: this.extractForms($),
      tables: this.extractTables($),
      buttons: this.extractButtons($),
      links: this.extractLinks($, url),
      metadata: this.extractMetadata($)
    };

    return content;
  }

  private extractCleanText($: CheerioInstance): string {
    // Extract main content areas
    const contentSelectors = [
      'main', '.main', '#main',
      '.content', '#content',
      '.page-content', '.main-content',
      'article', '.article',
      '.container', '.wrapper'
    ];

    let mainText = '';

    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        mainText = element.text().trim();
        if (mainText.length > 100) break; // Found substantial content
      }
    }

    // Fallback to body text if no main content found
    if (!mainText || mainText.length < 100) {
      mainText = $('body').text().trim();
    }

    // Clean up the text
    return mainText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim()
      .substring(0, 5000); // Limit text length
  }

  private extractForms($: CheerioInstance): FormInfo[] {
    const forms: FormInfo[] = [];

    $('form').each((_: number, formElement: any) => {
      const $form = $(formElement);
      const fields = this.extractFormFields($, $form);

      if (fields.length > 0) {
        forms.push({
          id: $form.attr('id'),
          action: $form.attr('action'),
          method: $form.attr('method') || 'GET',
          fields,
          purpose: this.inferFormPurpose($, $form, fields)
        });
      }
    });

    return forms;
  }

  private extractFormFields($: CheerioInstance, $form: CheerioElement): any[] {
    const fields: any[] = [];

    $form.find('input, select, textarea').each((_: number, fieldElement: any) => {
      const $field = $(fieldElement);
      const type = $field.attr('type') || $field.prop('tagName')?.toLowerCase() || 'text';

      // Skip hidden and submit buttons for analysis
      if (type === 'hidden' || type === 'submit') return;

      const field = {
        name: $field.attr('name'),
        type,
        label: this.findFieldLabel($, $field),
        placeholder: $field.attr('placeholder'),
        required: $field.attr('required') !== undefined,
        options: this.extractSelectOptions($, $field)
      };

      fields.push(field);
    });

    return fields;
  }

  private findFieldLabel($: CheerioInstance, $field: CheerioElement): string | undefined {
    // Try to find associated label
    const fieldId = $field.attr('id');
    if (fieldId) {
      const label = $(`label[for="${fieldId}"]`).text().trim();
      if (label) return label;
    }

    // Try parent label
    const parentLabel = $field.closest('label').text().trim();
    if (parentLabel) return parentLabel;

    // Try previous sibling
    const prevLabel = $field.prev('label').text().trim();
    if (prevLabel) return prevLabel;

    // Try placeholder as fallback
    return $field.attr('placeholder');
  }

  private extractSelectOptions($: CheerioInstance, $field: CheerioElement): string[] | undefined {
    if ($field.prop('tagName')?.toLowerCase() === 'select') {
      const options: string[] = [];
      $field.find('option').each((_: number, option: any) => {
        const text = $(option).text().trim();
        if (text && text !== 'Select...') {
          options.push(text);
        }
      });
      return options.length > 0 ? options : undefined;
    }
    return undefined;
  }

  private inferFormPurpose($: CheerioInstance, $form: CheerioElement, fields: any[]): string {
    const formText = $form.text().toLowerCase();
    const fieldNames = fields.map(f => f.name?.toLowerCase() || '').join(' ');
    const combined = `${formText} ${fieldNames}`;

    if (combined.includes('search') || combined.includes('query')) return 'search';
    if (combined.includes('login') || combined.includes('signin')) return 'login';
    if (combined.includes('register') || combined.includes('signup')) return 'registration';
    if (combined.includes('contact') || combined.includes('message')) return 'contact';
    if (combined.includes('filter') || combined.includes('sort')) return 'filter';
    if (combined.includes('edit') || combined.includes('update')) return 'edit';
    if (combined.includes('create') || combined.includes('add') || combined.includes('new')) return 'create';
    if (combined.includes('delete') || combined.includes('remove')) return 'delete';
    if (combined.includes('upload') || combined.includes('file')) return 'upload';
    if (combined.includes('payment') || combined.includes('billing')) return 'payment';

    return 'data-entry';
  }

  private extractTables($: CheerioInstance): TableInfo[] {
    const tables: TableInfo[] = [];

    $('table, [role="grid"], .table, .data-table').each((_: number, tableElement: any) => {
      const $table = $(tableElement);
      const headers = this.extractTableHeaders($, $table);
      const rowCount = this.countTableRows($, $table);

      if (headers.length > 0 || rowCount > 0) {
        tables.push({
          id: $table.attr('id'),
          headers,
          rowCount,
          hasActions: this.hasTableActions($, $table),
          purpose: this.inferTablePurpose($, $table, headers)
        });
      }
    });

    return tables;
  }

  private extractTableHeaders($: CheerioInstance, $table: CheerioElement): string[] {
    const headers: string[] = [];

    $table.find('th, thead td, .table-header').each((_: number, headerElement: any) => {
      const text = $(headerElement).text().trim();
      if (text) headers.push(text);
    });

    return headers;
  }

  private countTableRows($: CheerioInstance, $table: CheerioElement): number {
    return $table.find('tbody tr, .table-row').length;
  }

  private hasTableActions($: CheerioInstance, $table: CheerioElement): boolean {
    return $table.find('button, .btn, .action, [role="button"]').length > 0;
  }

  private inferTablePurpose($: CheerioInstance, $table: CheerioElement, headers: string[]): string {
    const tableText = $table.text().toLowerCase();
    const headerText = headers.join(' ').toLowerCase();
    const combined = `${tableText} ${headerText}`;

    if (combined.includes('user') || combined.includes('employee')) return 'user-management';
    if (combined.includes('order') || combined.includes('transaction')) return 'order-management';
    if (combined.includes('product') || combined.includes('item')) return 'product-catalog';
    if (combined.includes('report') || combined.includes('statistic')) return 'reporting';
    if (combined.includes('log') || combined.includes('history')) return 'audit-trail';
    if (combined.includes('permission') || combined.includes('role')) return 'access-control';
    if (combined.includes('config') || combined.includes('setting')) return 'configuration';
    if (combined.includes('data') || combined.includes('record')) return 'data-management';

    return 'data-display';
  }

  private extractButtons($: CheerioInstance): ButtonInfo[] {
    const buttons: ButtonInfo[] = [];

    $('button, input[type="submit"], input[type="button"], .btn, [role="button"]').each((_: number, buttonElement: any) => {
      const $button = $(buttonElement);
      const text = $button.text().trim() || $button.attr('value') || $button.attr('title') || '';

      if (text) {
        buttons.push({
          text,
          type: $button.attr('type'),
          purpose: this.inferButtonPurpose(text),
          action: $button.attr('onclick') || $button.attr('data-action')
        });
      }
    });

    return buttons;
  }

  private inferButtonPurpose(text: string): string {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('save') || lowerText.includes('submit')) return 'save';
    if (lowerText.includes('edit') || lowerText.includes('modify')) return 'edit';
    if (lowerText.includes('delete') || lowerText.includes('remove')) return 'delete';
    if (lowerText.includes('create') || lowerText.includes('add') || lowerText.includes('new')) return 'create';
    if (lowerText.includes('search') || lowerText.includes('find')) return 'search';
    if (lowerText.includes('export') || lowerText.includes('download')) return 'export';
    if (lowerText.includes('import') || lowerText.includes('upload')) return 'import';
    if (lowerText.includes('copy') || lowerText.includes('duplicate')) return 'copy';
    if (lowerText.includes('print')) return 'print';
    if (lowerText.includes('cancel') || lowerText.includes('close')) return 'cancel';
    if (lowerText.includes('confirm') || lowerText.includes('ok')) return 'confirm';
    if (lowerText.includes('reset') || lowerText.includes('clear')) return 'reset';

    return 'action';
  }

  private extractLinks($: CheerioInstance, baseUrl: string): LinkInfo[] {
    const links: LinkInfo[] = [];
    const base = new URL(baseUrl);

    $('a[href]').each((_: number, linkElement: any) => {
      const $link = $(linkElement);
      const href = $link.attr('href');
      const text = $link.text().trim();

      if (href && text) {
        try {
          const url = new URL(href, baseUrl);
          links.push({
            text,
            href: url.toString(),
            isInternal: url.hostname === base.hostname
          });
        } catch (error) {
          // Invalid URL, skip
        }
      }
    });

    return links;
  }

  private extractMetadata($: CheerioInstance): PageMetadata {
    const breadcrumbs: string[] = [];

    // Extract breadcrumbs
    $('.breadcrumb, .breadcrumbs, [aria-label="breadcrumb"]').find('a, span').each((_: number, element: any) => {
      const text = $(element).text().trim();
      if (text) breadcrumbs.push(text);
    });

    return {
      description: $('meta[name="description"]').attr('content'),
      keywords: $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()),
      breadcrumbs,
      pageType: this.inferPageType($)
    };
  }

  private inferPageType($: CheerioInstance): string {
    const title = $('title').text().toLowerCase();
    const bodyClass = $('body').attr('class') || '';
    const combined = `${title} ${bodyClass}`.toLowerCase();

    if (combined.includes('dashboard')) return 'dashboard';
    if (combined.includes('list') || combined.includes('index')) return 'list';
    if (combined.includes('detail') || combined.includes('view')) return 'detail';
    if (combined.includes('edit') || combined.includes('form')) return 'form';
    if (combined.includes('report')) return 'report';
    if (combined.includes('setting') || combined.includes('config')) return 'settings';
    if (combined.includes('admin')) return 'admin';

    return 'content';
  }
}