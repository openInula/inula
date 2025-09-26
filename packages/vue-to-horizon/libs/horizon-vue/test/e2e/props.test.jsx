/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { describe, expect, it } from 'vitest';
import { transform } from '../mock.js'

describe('mapping2ForPlugin', () => {
  it('should transform map to for jsxelement', () => {
    const code = `
        <template>
  <div class="importExFileMgrWrapper">
    <div class="importExFileMgrupArea">
      <div class="title">
        <div class="titleArea">
          <div v-bind:style="{ color: classforIcon }" class="titleIcon icon-marvelIcon-16" v-on:click="setParseAndSearchDefensive"></div>
          <div class="titleName">{{ $l('L.I_GUIDE_TITLE') }}</div>
        </div>
      </div>
      <!-- stc項目 -->
      <div v-show="isStcProject" class="cls4StcWrapper">
        <div style="margin-left: 22px">{{ '*' + $l('L.stcInfo') }}</div>
        <div class="cls4StcCont">
          <div>
            {{ $l('L.stcCertificate') }} <span style="margin-right: 20px">{{ stcCertificate }}</span>
            <!-- {{$l("L.stcAuthRange")}} <span>{{stcAuthRange}}</span>-->
            {{ $l('L.stcExpireTime') }} <span>{{ stcExpireTime }}</span>
          </div>
          <!--<div>{{$l("L.stcDescription")}}: <span>{{stcDescription}}</span></div>-->
        </div>
      </div>
      <div class="cls4ImportTip">
        <strong class="cls4ImportTipNote">{{ $l('L.PARSE_IMPORT_TIP_NOTE') }}</strong>

        {{ $l('L.PARSE_IMPORT_TIP') }}
        <marvel-txt-button
          size="normal"
          classCustom="classCustom1"
          :label="$l('L.SCRIPT_SHORT_TOOL')"
          icon="icon-download"
          v-show="!isLite"
          v-on:onClick="onClick4ScriptShortTool"></marvel-txt-button>
      </div>
      <div class="tipArea">
        <div class="tip1Area" v-show="!isLite">
          <div class="tip">{{ $l('L.I_GUIDE_TIP3') }}</div>
          <div class="viewParseButton">
            <marvel-txt-button
              size="normal"
              classCustom="classCustom1"
              :label="$l('L.I_VIEW_PARSE_ABILITY')"
              icon="icon-download"
              v-on:onClick="onClick4ViewParseBase"></marvel-txt-button>
          </div>
        </div>
        <div class="tip1Area" v-show="!isLite">
          <div class="tip1">{{ $l('L.I_GUIDE_TIP1') }}</div>
          <div class="downloadGuideButton">
            <marvel-txt-button
              size="small"
              classCustom="classCustom1"
              :label="$l('L.I_DOWNLOAD_GUIDE')"
              icon="icon-download"
              v-on:onClick="onClick4DownloadGuide"></marvel-txt-button>
          </div>
          <div class="downloadGuideButton">
            <marvel-txt-button
              size="small"
              classCustom="classCustom1"
              :label="$l('L.I_DOWNLOAD_GUIDE_THRIDPATY')"
              icon="icon-download"
              v-on:onClick="onClick4DownloadGuideThirdParty"></marvel-txt-button>
          </div>
        </div>
        <div class="tip1Area">
          <div class="tip2">{{ $l('L.I_GUIDE_TIP2') }}</div>
          <div class="downloadTemButton">
            <marvel-txt-button
              size="normal"
              classCustom="classCustom1"
              :label="$l('L.I_DOWNLOAD_TEMPLATE')"
              icon="icon-download"
              v-on:onClick="onClick4Download"></marvel-txt-button>
          </div>
          <marvel-dialog
            theme="dark"
            :showDialog="showDialog4DownloadTemplate"
            :title="$l('L.I_DOWNLOAD_TEMPLATE_TITLE')"
            :width="700"
            :height="height4DownloadTemplate"
            v-on:onClickDialogClose="onClickDialogCloseDownloadTemplate">
            <template #dialogCont>
              <div>
                <div class="importExFileMgrTitle">&nbsp{{ $l('L.I_DOWNLOAD_TEMPLATE_TIP') }}</div>
                <div class="importExFileMgrRadioBox">
                  <marvel-radio-box
                    ref="ref1"
                    id="id1"
                    group="group1"
                    class="importExFileMgrRadioWrapper"
                    :label="this.$l('L.I_TEMPLATE_NELINK')"
                    :showLabel="true"></marvel-radio-box>
                  <div class="radioBox1Info">{{ $l('L.I_TEMPLATE_NELINK_TIP') }}</div>
                </div>
                <div class="importExFileMgrRadioBox">
                  <marvel-radio-box
                    ref="ref2"
                    id="id2"
                    group="group1"
                    class="importExFileMgrRadioWrapper"
                    :label="this.$l('L.I_TEMPLATE_SITE')"
                    :showLabel="true"></marvel-radio-box>
                  <div class="radioBox2Info">{{ $l('L.I_TEMPLATE_SITE_TIP') }}</div>
                </div>
              </div>
            </template>
            <template #dialogFoot>
              <div>
                <marvel-icon-txt-button
                  size="small"
                  classCustom="classCustom1"
                  :label="$l('L.I_SDM_DOWNLOAD')"
                  icon="icon-download"
                  v-on:onClick="onClick4DownloadTemplateFile"></marvel-icon-txt-button>
                <marvel-icon-txt-button
                  size="small"
                  classCustom="classCustom1"
                  :label="$l('L.TEXT_CANCEL')"
                  icon="icon-cancel-circle"
                  v-on:onClick="onClickDialogCloseDownloadTemplate"></marvel-icon-txt-button>
              </div>
            </template>
          </marvel-dialog>
        </div>
        <div class="tip1Area">
          <div class="tip1">{{ $l('L.PARSE_BOARD_INFO_TIP') }}</div>
        </div>
        <div class="tip1Area">
          <div class="tip1">{{ $l('L.MV_HW_DESCRIPTION') }}</div>
        </div>
      </div>
    </div>
    <div class="downArea">
      <div class="title">
        <div class="titleArea">
          <div class="titleIcon icon-list" v-on:click="_showGtsPage"></div>
          <div class="titleName">{{ $l('L.I_FILE_LIST') }}</div>
          <div class="loadingArea">
            <marvel-loading-mini ref="refMiniLoading" theme="dark"></marvel-loading-mini>
            <div v-show="temporarilyHideEx">
              <marvel-loading-mini ref="refMiniLoading4Parse" theme="dark" v-on:onCancel="onParseCancelClick"></marvel-loading-mini>
            </div>
            <div class="loadingIcon" v-if="show4QueueArea">
              <div class="icon">
                <div class="dot white"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
            </div>
            <div class="cls4QueueArea" v-html="html4Queue" v-if="show4QueueArea"></div>
          </div>
        </div>
        <div class="operationArea">
          <div v-show="isShowBtn4Base" class="class4BaseData">
            <marvel-icon-txt-button
              size="normal"
              classCustom="classCustom1"
              :label="$l('L.I_BASE_DATA')"
              icon="icon-upload"
              ref="ref4UploadBaseButton"
              v-on:onClick="onClick4UploadShowBaseData"></marvel-icon-txt-button>
          </div>
          <marvel-icon-txt-button
            size="normal"
            classCustom="classCustom1"
            :label="$l('L.SDM_UPLOAD_DATA')"
            icon="icon-upload"
            ref="ref4UploadButton"
            v-show="projectType !== 'demoProject' && !isOnMasterProject"
            v-on:onClick="onClick4UploadShow"></marvel-icon-txt-button>
          <marvel-icon-txt-button
            size="normal"
            classCustom="classCustom1"
            :label="$l('L.DEMO_PROJECT_SCRIPT')"
            icon="icon-upload"
            ref="ref4UploadDemoProject"
            v-show="projectType === 'demoProject'"
            v-on:onClick="onClick4UploadDemoProject"></marvel-icon-txt-button>
          <div v-if="showDialog">
            <marvel-dialog
              theme="dark"
              :showDialog="showDialog"
              :title="$l('L.I_DATA_UPLOAD')"
              :width="500"
              :height="height385"
              v-on:onClickDialogClose="onClickDialogClose">
              <template #dialogCont>
                <div>
                  <div class="fileSelectTitle importExFileMgrTitle">
                    <span style="color: red">{{ $l('L.I_UPLAOD_SUPPORT_TYPE') }}</span>
                  </div>
                  <div class="fileSelectArea">
                    <div v-show="debug == true">
                      <marvel-upload
                        ref="ref4Upload"
                        theme="dark"
                        placeHolder="Please choose a file"
                        v-on:onSelectFileBtnClick="onSelectFileBtnClick"></marvel-upload>
                    </div>
                    <div v-show="debug == false">
                      <input class="uploadFileName4Import" readonly="readonly" disabled type="text" :placeholder="placeHolder" :value="fileName" />
                      <browse-button id="selectPathScript" @onSelectFileBtnClick="onSelectFileBtnClick"></browse-button>
                    </div>
                  </div>
                  <div class="vendorSelectTitle importExFileMgrTitle">{{ $l('L.I_SELECT_TIP') }}</div>
                  <div class="vendorSelectArea">
                    <div class="vendorSelectAreaDropDown">
                      <marvel-drop-down-button
                        ref="ref4ButtonDropDownVendor"
                        width="100%"
                        maxHeight="120px"
                        :dropDownItems="dropDownItems4Vendor"
                        v-on:onOptionSelect="onVendorOptionsSelectClick">
                      </marvel-drop-down-button>
                    </div>
                    <div class="vendorSelectAreaDropDown" v-show="false">
                      <marvel-drop-down-button v-bind:disable="disable" ref="ref4ButtonDropDownTimeSlot" width="100%" :dropDownItems="dropDownItems4TimeSlot">
                      </marvel-drop-down-button>
                    </div>
                  </div>
                  <div class="saveMethodTip1" v-show="saveMethodTip">&nbsp;&nbsp;&nbsp;{{ $l('L.I_UPLOAD_SAVE_TEMPLATE_1') }}</div>
                  <div class="remarkInputTitle importExFileMgrTitle">{{ $l('L.I_REMARK_TIP') }}</div>
                  <div>
                    <marvel-multi-input ref="ref4Remark" :placeHolder="$l('L.I_REMARK_PLACEHOLDER')" :height="50" :inputMsg="inputMsg4Remark" theme="dark">
                    </marvel-multi-input>
                  </div>
                  <span class="fileSelectTip" v-show="showOverride">{{ uploadInfo }}</span>
                </div>
              </template>
              <template #dialogFoot>
                <div>
                  <marvel-icon-txt-button
                    size="small"
                    classCustom="classCustom1"
                    :label="$l('L.I_UPLOAD')"
                    icon="icon-upload"
                    theme="dark"
                    v-on:onClick="onClick4UploadOK"></marvel-icon-txt-button>
                  <marvel-icon-txt-button
                    size="small"
                    classCustom="classCustom1"
                    :label="$l('L.TEXT_CANCEL')"
                    icon="icon-cancel-circle"
                    theme="dark"
                    v-on:onClick="onClick4UploadCancel"></marvel-icon-txt-button>
                </div>
              </template>
            </marvel-dialog>
          </div>
        </div>
      </div>
      <div class="gridArea">
        <marvel-grid-ex
          ref="ref4FileListGrid"
          :titles="titles4FileMgr"
          :rows="rows4FileMgr"
          :limit="this.perPageNum"
          :showChangeLimit="true"
          :limitRange="[5, 10, 20]"
          :canDrag="true"
          gridId="gridId4FileLst"
          :dynamicPaging="true"
          :totalNum="totalNum4FileList"
          :totalPage="totalPage4FileList"
          v-on:onIconClick="onGridRowIconClickDebounce"
          v-on:onOptionChange="onOptionChangeDataTypeOrTimeSlot"
          v-on:onPerPageNumChange="onPerPageNumChange"
          v-on:onPageChange="onPageChange4FileList"
          v-on:onClickRow="onClick4FileListGrid"
          :editCellFinished="editFileRemarkFinishedEx"></marvel-grid-ex>
        <marvel-dialog
          theme="dark"
          :showDialog="showDialog4PgID"
          :title="$l('L.I_TEXT_ATTENTION')"
          :width="500"
          :height="200"
          v-on:onClickDialogClose="onClickDialogClosePgID">
          <template #dialogCont>
            <div>
              <div class="errorInfo">{{ $l('L.I_SDM_PGID_CONFORM') }}</div>
            </div>
          </template>
          <template #dialogFoot>
            <div>
              <marvel-icon-txt-button
                size="normal"
                classCustom="classCustom1"
                :label="$l('L.I_TEXT_CONTINUE')"
                icon="icon-play2"
                theme="dark"
                v-on:onClick="onClick4PgIdContinue"></marvel-icon-txt-button>
              <marvel-icon-txt-button
                size="normal"
                classCustom="classCustom1"
                :label="$l('L.TEXT_CANCEL')"
                icon="icon-cancel-circle"
                theme="dark"
                v-on:onClick="onClick4PgIdCancel"></marvel-icon-txt-button>
            </div>
          </template>
        </marvel-dialog>
        <marvel-dialog
          theme="dark"
          :showDialog="showDialog4ScriptError"
          :title="$l('L.I_TEXT_ATTENTION')"
          :width="500"
          :height="250"
          v-on:onClickDialogClose="onClick4ScriptErrorCancel">
          <template #dialogCont>
            <div>
              <div class="errorInfo">{{ $l('L.I_SDM_FILE_CONFORM') }}</div>
            </div>
          </template>
          <template #dialogFoot>
            <div>
              <marvel-icon-txt-button
                size="small"
                classCustom="classCustom1"
                :label="$l('L.I_TEXT_CONTINUE')"
                icon="icon-play2"
                theme="dark"
                v-on:onClick="onClick4ScriptErrorContinue"></marvel-icon-txt-button>
              <marvel-icon-txt-button
                size="small"
                classCustom="classCustom1"
                :label="$l('L.TEXT_CANCEL')"
                icon="icon-cancel-circle"
                theme="dark"
                v-on:onClick="onClick4ScriptErrorCancel"></marvel-icon-txt-button>
            </div>
          </template>
        </marvel-dialog>
        <marvel-dialog
          theme="dark"
          :showDialog="showDialog4DeleteFile"
          :title="$l('L.CONFIRM')"
          :width="500"
          :height="200"
          v-on:onClickDialogClose="onClick4DeleteFileCancel">
          <template #dialogCont>
            <div>
              <div class="errorInfo">{{ deleteFileTip }}</div>
            </div>
          </template>
          <template #dialogFoot>
            <div>
              <marvel-icon-txt-button
                size="normal"
                classCustom="classCustom1"
                :label="$l('L.CONFIRM')"
                icon="icon-checkmark"
                theme="dark"
                v-on:onClick="onClick4DeleteFileOK"></marvel-icon-txt-button>
              <marvel-icon-txt-button
                size="normal"
                classCustom="classCustom1"
                :label="$l('L.TEXT_CANCEL')"
                icon="icon-cancel-circle"
                theme="dark"
                v-on:onClick="onClick4DeleteFileCancel"></marvel-icon-txt-button>
            </div>
          </template>
        </marvel-dialog>

        <marvel-dialog
          :showDialog="showDialog4ParseTrail"
          :title="$l('L.TEXT_PARSEDATA')"
          :width="500"
          :height="430"
          v-on:onClickDialogClose="onClick4ParseTrailCancel">
          <template #dialogCont>
            <div>
              <div>
                {{ dialogCont4ParseTrail }}
              </div>
              <div class="class4ParseTrailCheckBox">
                <marvel-check-box
                  class="checkBox"
                  ref="ref4CheckBoxParseTrail"
                  id="id4CheckParseTrail"
                  :label="$l('L.TEXT_PARSEDATA_PARSETRAIL')"
                  :showLabel="true"
                  v-on:onChange="selectParseTrail">
                </marvel-check-box>
              </div>
              <div>
                <p style="width: 100%">
                  <label>{{ dialogCont4ParseTrailRemarksTitle }}</label>
                </p>
                <div style="width: 100%">
                  <label>
                    {{ dialogCont4ParseTrailRemarksSelect0 }}<span style="color: blue">{{ dialogCont4ParseTrailRemarksSelect1 }}</span
                    >{{ dialogCont4ParseTrailRemarksSelect2 }}
                  </label>
                </div>
                <div style="width: 100%">
                  <label>
                    {{ dialogCont4ParseTrailRemarksUnselect0 }}<span style="color: blue">{{ dialogCont4ParseTrailRemarksUnselect1 }}</span
                    >{{ dialogCont4ParseTrailRemarksUnselect2 }}
                  </label>
                </div>
                <p>
                  <label>{{ dialogCont4ParseTrailRemarks }}</label>
                </p>
              </div>
            </div>
          </template>
          <template #dialogFoot>
            <div>
              <marvel-icon-txt-button
                ref="ref4ParseDataButton"
                size="normal"
                classCustom="classCustom"
                :label="$l('L.I_SDM_PARSE')"
                icon="icon-checkmark"
                v-on:onClick="onClick4ParseTrailOk">
              </marvel-icon-txt-button>
            </div>
          </template>
        </marvel-dialog>
      </div>
    </div>
    <import-ex-upload-base-data ref="ref4ImportExUploadBaseData"></import-ex-upload-base-data>
    <marvel-confirm-dialog
      :showConfirm="showComfirm4EosParse"
      :confirmCont="confirmCont4EosParse"
      v-on:onClickOK="onClick4EosParseOk"
      v-on:onClickCancel="onClick4EosParseCancel"
      tipType="tip"></marvel-confirm-dialog>
    <marvel-dialog
      :showDialog="showDialog4PreParse"
      :title="$l('L.HW_SCRIPT_PRE_PARSE_ERR_MSG_DIALOG_TIP0')"
      :width="700"
      :height="400"
      v-on:onClickDialogClose="onClickDialogClose4PreParse">
      <template #dialogCont>
        <div style="height: 100%">
          <div class="checkContTitle">{{ $l('L.HW_SCRIPT_PRE_PARSE_ERR_MSG_DIALOG_TIP1') }}</div>
          <div class="checkContInfo" v-html="html4UploadFormat"></div>
          <div class="checkContTip">{{ $l('L.HW_SCRIPT_PRE_PARSE_ERR_MSG_DIALOG_TIP2') }}</div>
          <div class="checkContInfo" v-html="html4WholeNet"></div>
          <div class="checkContTip">{{ $l('L.HW_SCRIPT_PRE_PARSE_ERR_MSG_DIALOG_TIP3') }}</div>
          <div class="checkContInfo" v-html="html4OneNe"></div>
          <div class="checkContTip">{{ $l('L.HW_SCRIPT_PRE_PARSE_ERR_MSG_DIALOG_TIP4') }}</div>
        </div>
      </template>
      <template #dialogFoot>
        <div>
          <marvel-icon-txt-button
            size="small"
            classCustom="classCustom1"
            :label="$l('L.HW_SCRIPT_PRE_PARSE_ERR_MSG_DIALOG_TIP5')"
            icon="icon-marvelIcon-19"
            v-on:onClick="onClickDialogPreParse4LookGuide"></marvel-icon-txt-button>
          <marvel-icon-txt-button
            size="small"
            classCustom="classCustom1"
            :label="$l('L.analysis_OK')"
            icon="icon-checkmark"
            v-on:onClick="onClickDialogPreParse4Confirm"></marvel-icon-txt-button>
        </div>
      </template>
    </marvel-dialog>
    <marvel-dialog
      theme="dark"
      :showDialog="showHuaweiScriptConflict"
      :title="$l('L.PROMPT')"
      :width="450"
      :height="220"
      v-on:onClickDialogClose="onClickHuaweiScriptCancel">
      <template #dialogCont>
        <div>
          <div class="scriptConflictContent">{{ this.$l('L.TEXT_PARSER_EXIST_SAME_NE_NAME_DIFF_ORIGINAL_ID') }}</div>
        </div>
      </template>
      <template #dialogFoot>
        <div>
          <marvel-icon-txt-button
            size="normal"
            classCustom="classCustom1"
            :label="$l('L.analysis_OK')"
            theme="dark"
            v-on:onClick="onClickHuaweiScriptConfirm"></marvel-icon-txt-button>
          <marvel-icon-txt-button
            size="normal"
            classCustom="classCustom1"
            :label="$l('L.analysis_Cancel')"
            theme="dark"
            v-on:onClick="onClickHuaweiScriptCancel"></marvel-icon-txt-button>
        </div>
      </template>
    </marvel-dialog>
    <marvel-dialog
      theme="dark"
      key="DemoProjectUpload"
      :showDialog="showDialog4DemoProject"
      :title="$l('L.DEMO_PROJECT_SCRIPT_UPLOAD')"
      :width="450"
      :height="220"
      @onClickDialogClose="cancel4DemoProjectDialog"
    >
      <template #dialogCont>
        <div class="cls4DemoProjectDialogCont">
          <div class="ellipsis">{{ $l('L.DEMO_PROJECT_DATA_TYPE') }}:</div>
          <div>
            <marvel-input-drop-down
              ref="ref4DemoProjectType"
              width="100%"
              :dropDownItems="dropDownItems4DemoProject"
              maxHeight="200px"
            ></marvel-input-drop-down>
          </div>
        </div>
      </template>
      <template #dialogFoot>
        <marvel-icon-txt-button size="normal" :label="$l('L.analysis_OK')" theme="dark" @onClick="confirm4DemoProjectDialog"></marvel-icon-txt-button>
        <marvel-icon-txt-button size="normal" :label="$l('L.analysis_Cancel')" theme="dark" @onClick="cancel4DemoProjectDialog"></marvel-icon-txt-button>
      </template>
    </marvel-dialog>
  </div>
</template>

<script>
import MarvelGridEx from '^/widget/grid/MarvelGridExFilter';
import MarvelIconTxtButton from '^/widget/button/MarvelIconTxtButton';
import MarvelTxtButton from '^/widget/button/MarvelTxtButton';
import MarvelDialog from '^/widget/dialog/MarvelDialog';
import MarvelLoadingMini from '^/widget/loading/MarvelLoadingMini';
import MarvelUpload from '^/widget/upload/MarvelUpload';
import MarvelRadioBox from '^/widget/select/MarvelRadioBox';
import MarvelMultiInput from '^/widget/input/MarvelMultiInput';
import MarvelDropDownButton from '^/widget/button/MarvelDropDownButton';
import MarvelTimer from '^/component/timer';
import CommonUtils from '@/pages/index/components/1.importex/1.0.common';
import ImportExUploadBaseData from '@/pages/index/components/1.importex/ImportExUploadBaseData';
import MarvelConfirmDialog from '^/widget/dialog/MarvelConfirm';
import MarvelCheckBox from '^/widget/select/MarvelCheckBox';
import MarvelInputDropDown from '^/widget/button/MarvelInputDropDown';
import MarvelStr from '^/component/str';
import SensitiveCheckUtils from '@/components/0.common/SensitiveCheckUtils';
import BrowseButton from '@/components/0.common/0.10.extract/BrowseButton';
import httpUtil from '@/components/0.common/httpUtil';
import { debounce, showGtsPage, retry } from '@/components/0.common/CommonUtils';
import {MODULE_TYPE} from '../../../../components/0.common/Const/moduleType';

export default {
  components: {
    MarvelMultiInput,
    MarvelUpload,
    MarvelLoadingMini,
    MarvelDialog,
    MarvelIconTxtButton,
    MarvelTxtButton,
    MarvelGridEx,
    MarvelDropDownButton,
    MarvelTimer,
    MarvelRadioBox,
    CommonUtils,
    ImportExUploadBaseData,
    MarvelConfirmDialog,
    MarvelCheckBox,
    BrowseButton,
    MarvelInputDropDown,
  },
  name: 'ImportExFileMgr',
  props: {
    switchReact: {
      type: Boolean,
      require: true,
    }
  },
  data: function () {
    return {
      // region const
      classforIcon: 'grey',
      // “从数据底座上传数据”按钮先隐藏
      isShowBtn4Base: false,
      debug: false,
      timerIntervel: 2000,
      temporarilyHideEx: true,
      // endregion
      // region fileGrid
      titles4FileMgr: [
        {
          label: this.$l('L.I_TEXT_TABLE_NO'),
          width: '50px',
          key: 'order',
          visible: true,
          orderBy: false,
          type: 'text',
        },
        {
          label: this.$l('L.I_TEXT_TABLE_FILENAME'),
          width: '300px',
          key: 'fileName',
          visible: true,
          orderBy: false,
          type: 'text',
        },
        {
          label: this.$l('L.I_TEXT_TABLE_FILETYPE'),
          width: '70px',
          key: 'fileType',
          visible: true,
          orderBy: false,
          type: 'text',
        },
        {
          label: this.$l('L.I_SDM_UPLOAD_OPERATOR'),
          width: '100px',
          key: 'uploadUser',
          visible: true,
          orderBy: false,
          type: 'text',
        },
        {
          label: this.$l('L.I_SDM_UPLOAD_TIME'),
          width: '150px',
          key: 'uploadTime',
          visible: true,
          orderBy: false,
          type: 'text',
        },
        {
          label: this.$l('L.I_SDM_PARSE_FLAG'),
          width: '135px',
          key: 'parseStatus',
          visible: true,
          orderBy: false,
          type: 'text',
        },
        {
          label: this.$l('L.I_SDM_PARSE_TIME'),
          width: '150px',
          key: 'parseTime',
          visible: true,
          orderBy: false,
          type: 'text',
        },
        {
          label: this.$l('L.I_SDM_UPLOAD_REMARK'),
          width: '150px',
          key: 'remark',
          visible: true,
          orderBy: false,
          type: 'input',
        },
        {
          label: this.$l('L.I_SDM_DATA_TYPE'),
          width: '170px',
          key: 'dataType',
          visible: true,
          orderBy: false,
          type: 'dropdown',
        },
        {
          label: this.$l('L.I_SDM_COLLECT_MODE'),
          width: '120px',
          key: 'collectMode',
          visible: true,
          orderBy: false,
          type: 'dropdown',
        },
        {
          label: this.$l('L.I_SDM_TIME_SLOT_DISPLAY'),
          width: '120px',
          key: 'timeSlot',
          visible: true,
          orderBy: false,
          type: 'dropdown',
        },
        {
          label: this.$l('L.I_SDM_PARSE'),
          width: '100px',
          key: 'parse',
          visible: true,
          orderBy: false,
          type: 'icon',
        },
        {
          label: this.$l('L.I_SDM_DOWNLOAD'),
          width: '100px',
          key: 'download',
          visible: true,
          orderBy: false,
          type: 'icon',
        },
        {
          label: this.$l('L.I_SDM_DELETE'),
          width: '90px',
          key: 'delete',
          visible: true,
          orderBy: false,
          type: 'icon',
        },
      ],
      skip4FileMgr: 0,
      totalNum4FileList: 0,
      totalPage4FileList: 0,
      perPageNum: 10,
      height385: 385,
      rows4FileMgr: [],
      globalTargetTimeSlot: -1,
      // EOS解析
      showComfirm4EosParse: false,
      param4EosParse: {},
      confirmCont4EosParse: this.$l('L.ERROR_PARSE_TIP'),
      // endregion
      // region dowload Template
      showDialog4DownloadTemplate: false,
      height4DownloadTemplate: 380,
      // endregion
      // region upload dialog
      showDialog: false,
      showOverride: false,
      fileName: '',
      placeHolder: 'Please choose a file',
      inputMsg4Remark: '',
      inputMsg4Vendor: '',
      inputMsg4CollectMode: '',
      inputMsg4TimeSlotMode: '',
      uploadInfo: this.$l('L.I_UPLOAD_REPEAT_INFO'),
      parseFlagInUpload: true,
      // endregion
      // region upload vendor dropDown
      saveMethodTip: false,
      lstItemsVendor: [],
      // 全量厂商分组
      lstItemsVendorOrigin: [
        {
          dataType: 200,
          label: this.$l('L.I_SDM_NMS_SCRIPTS_DW'),
        },
        {
          label: 'ALU (Alcatel)',
          dataType: 1,
        },
        {
          dataType: 2,
          label: 'ECI',
        },
        {
          label: 'FIBCOM',
          dataType: 4,
        },
        {
          dataType: 5,
          label: 'FUJITSU',
        },
        {
          label: 'ALU (Lucent)',
          dataType: 6,
        },
        {
          dataType: 7,
          label: 'NOKIA',
        },
        {
          label: 'Nortel',
          dataType: 8,
        },
        {
          dataType: 9,
          label: 'NSN',
        },
        {
          label: 'SYCAMORE',
          dataType: 10,
        },
        {
          dataType: 11,
          label: 'Tellabs',
        },
        {
          label: 'ZTE',
          dataType: 12,
        },
        {
          dataType: 13,
          label: 'Marconi',
        },
        {
          dataType: 20,
          label: 'NEC',
        },
        {
          dataType: 21,
          label: this.$l('L.FIBERHOME_SCRIPTS'),
        },
        {
          label: this.$l('L.I_SDM_PACKET_DATA'),
          dataType: 15,
        },
        {
          label: this.$l('L.I_SINGLE_SITE_PACKET_DATA'),
          dataType: 135,
        },
        {
          label: this.$l('L.I_HW_ALARM_PKT_DATA'),
          dataType: 136,
        },
        {
          label: this.$l('L.I_ETH_PORT_RATE_DATA'),
          dataType: 137,
        },
        {
          dataType: 16,
          label: this.$l('L.I_SDM_NETWORK_TEMPLATE'),
        },
        {
          label: this.$l('L.I_SDM_SITE_TEMPLATE'),
          dataType: 17,
        },
        {
          dataType: 30,
          label: this.$l('L.I_HUAWEI_ALARM'),
        },
        {
          dataType: 31,
          label: this.$l('L.I_THIRD_ALARM'),
        },
        {
          dataType: 32,
          label: this.$l('L.EOO_CONFIG_PARSE'),
        },
        {
          label: this.$l('L.DESPECT_EOS_BUSINESS_TEMPLETE'),
          dataType: 19,
        },
        {
          dataType: 120,
          label: this.$l('L.EOX_DATA_INFORMATION'),
        },
        {
          dataType: 101,
          label: this.$l('L.DCN_SUBNET_DATA_INFORMATION'),
        },
        {
          dataType: 134,
          label: this.$l('L.GOV_DEVICE_ALARM_PARSE'),
        },
      ],
      // zip格式厂商分组
      lstItemsVendorScript: [
        {
          dataType: 200,
          label: this.$l('L.I_SDM_NMS_SCRIPTS_DW'),
        },
        {
          dataType: 1,
          label: 'ALU (Alcatel)',
        },
        {
          dataType: 2,
          label: 'ECI',
        },
        {
          dataType: 4,
          label: 'FIBCOM',
        },
        {
          dataType: 5,
          label: 'FUJITSU',
        },
        {
          dataType: 6,
          label: 'ALU (Lucent)',
        },
        {
          dataType: 7,
          label: 'NOKIA',
        },
        {
          dataType: 8,
          label: 'Nortel',
        },
        {
          dataType: 9,
          label: 'NSN',
        },
        {
          dataType: 10,
          label: 'SYCAMORE',
        },
        {
          dataType: 11,
          label: 'Tellabs',
        },
        {
          dataType: 12,
          label: 'ZTE',
        },
        {
          dataType: 13,
          label: 'Marconi',
        },
        {
          dataType: 20,
          label: 'NEC',
        },
        {
          dataType: 21,
          label: this.$l('L.FIBERHOME_SCRIPTS'),
        },
        {
          dataType: 15,
          label: this.$l('L.I_SDM_PACKET_DATA'),
        },
        {
          dataType: 135,
          label: this.$l('L.I_SDM_PACKET_DATA'),
        },
        {
          dataType: 136,
          label: this.$l('L.I_HW_ALARM_PKT_DATA'),
        },
        {
          dataType: 137,
          label: this.$l('L.I_ETH_PORT_RATE_DATA'),
        },
        {
          dataType: 30,
          label: this.$l('L.I_HUAWEI_ALARM'),
        },
        {
          dataType: 31,
          label: this.$l('L.I_THIRD_ALARM'),
        },
        {
          dataType: 19,
          label: this.$l('L.DESPECT_EOS_BUSINESS_TEMPLETE'),
        },
        {
          dataType: 120,
          label: this.$l('L.EOX_DATA_INFORMATION'),
        },
        {
          dataType: 101,
          label: this.$l('L.DCN_SUBNET_DATA_INFORMATION'),
        },
        {
          dataType: 134,
          label: this.$l('L.GOV_DEVICE_ALARM_PARSE'),
        },
      ],
      // excel格式厂商分组
      lstItemsVendorTemplate: [
        {
          dataType: 16,
          label: this.$l('L.I_SDM_NETWORK_TEMPLATE'),
        },
        {
          dataType: 17,
          label: this.$l('L.I_SDM_SITE_TEMPLATE'),
        },
        {
          dataType: 32,
          label: this.$l('L.EOO_CONFIG_PARSE'),
        },
      ],
      // 告警类型厂商分组
      lstItemsVendorAlarm: [
        {
          dataType: 30,
          label: this.$l('L.I_HUAWEI_ALARM'),
        },
        {
          dataType: 31,
          label: this.$l('L.I_THIRD_ALARM'),
        },
        {
          dataType: 134,
          label: this.$l('L.GOV_DEVICE_ALARM_PARSE'),
        },
        {
          dataType: 136,
          label: this.$l('L.I_HW_ALARM_PKT_DATA'),
        },
      ],
      // EOS类型厂商分组
      lstItemsVendorEos: [
        {
          dataType: 19,
          label: this.$l('L.DESPECT_EOS_BUSINESS_TEMPLETE'),
        },
       {
          dataType: 30,
          label: this.$l('L.I_HUAWEI_ALARM'),
        },
        {
          dataType: 31,
          label: this.$l('L.I_THIRD_ALARM'),
        },
        {
          dataType: 200,
          label: this.$l('L.I_SDM_NMS_SCRIPTS_DW'),
        },
      ],
      // endregion
      // region upload timeSlot dropDown
      lstItemsTimeSlotOrigin: [
        { timeSlot: 2, label: this.$l('L.I_SDM_HW_MODE') },
        { timeSlot: 1, label: this.$l('L.I_SDM_LUCENT_MODE') },
      ],
      lstItemsTimeSlotNull: [{ timeSlot: -1, label: '-' }],
      disable: '',
      // endregion
      // region message

      // endregion
      // region parse params
      verifyDataConsistencyFlag: false,
      currentParseType: undefined,
      curParseVendor: undefined,
      parseStatus: '',
      uploadStatus: '',
      onloadQuery: true,
      // endregion
      // region pgid error
      showDialog4PgID: false,
      showDialog4ScriptError: false,
      sdmMess: {},
      // endregion
      // region deleteFile
      showDialog4DeleteFile: false,
      currentSelectRow: undefined,
      deleteFileTip: '',
      currentParseFileName: '',
      currentParseParam: {},
      dropDownItems4Vendor: [],
      dropDownItems4TimeSlot: [],

      // 是否解析trail弹框
      showDialog4ParseTrail: false,
      // 待解析华为脚本网元个数
      HWNeNum: '',
      HWNeTime: '',
      HWTrailTime: '',
      isParseTrail: undefined,
      dialogCont4ParseTrail: this.$l('L.TEXT_PARSEDATA_PROMPT'),
      dialogCont4ParseTrailRemarksTitle: this.$l('L.TEXT_PARSEDATA_REMARKS_TITLE'),
      dialogCont4ParseTrailRemarksSelect0: this.$l('L.TEXT_PARSEDATA_REMARKS_SELECT0'),
      dialogCont4ParseTrailRemarksSelect1: this.$l('L.TEXT_PARSEDATA_REMARKS_SELECT1'),
      dialogCont4ParseTrailRemarksSelect2: this.$l('L.TEXT_PARSEDATA_REMARKS_SELECT2'),
      dialogCont4ParseTrailRemarksUnselect0: this.$l('L.TEXT_PARSEDATA_REMARKS_UNSELECT0'),
      dialogCont4ParseTrailRemarksUnselect1: this.$l('L.TEXT_PARSEDATA_REMARKS_UNSELECT1'),
      dialogCont4ParseTrailRemarksUnselect2: this.$l('L.TEXT_PARSEDATA_REMARKS_UNSELECT2'),
      dialogCont4ParseTrailRemarks: this.$l('L.TEXT_PARSEDATA_REMARKS'),
      // //endregion

      timer4Script: undefined,
      isLite: window.isLite,
      isStcProject: window.isStcProject,
      stcCertificate: window.stcCertificate,
      stcAuthRange: window.stcAuthRange,
      stcExpireTime: new Date(window.stcExpireTime).getFullYear() === 9999 ? this.$l('L.stcTicketClosed90Days') : window.stcExpireTime,
      stcDescription: window.stcDescription,

      // region pre-parse
      showDialog4PreParse: false,
      html4UploadFormat: '',
      html4WholeNet: '',
      html4OneNe: '',
      curPreParseRow: [],
      html4Queue: '',
      show4QueueArea: false,
      showHuaweiScriptConflict: false,
      huaweiScriptConflictFilePath: '',
      isShowHuaweiScriptConflict: false,
      projectType: window.projectType,
      isOnMasterProject: window.isOnMasterProject,
      reactModeWatcher: null,
      // endregion pre-parse
      showDialog4DemoProject: false,
      dropDownItems4DemoProject: [
        {
          label: '',
          value: '',
          active: true,
        },
        {
          label: this.$l('L.DEMO_PROJECT_SDH_DATA'),
          value: 'SDH_SCRIPT',
          active: false,
        },
        {
          label: this.$l('L.DEMO_PROJECT_EOS_DATA'),
          value: 'SDH_SCRIPT_EOS',
          active: false,
        },
      ],
    };
  },
  created() {
    this.onGridRowIconClickDebounce = debounce(this.onGridRowIconClick, 1000, true);
  },
  mounted: function () {
    var self = this;
    // region custom
    this.init();
    let oParam = {
      userId: window.userId,
      projectId: window.projectId,
    };
    this.Api.appSwapApi.userPermission.checkUserPermission(this.debug, oParam, (resp) => {
      if (resp !== 1) {
        this.$refs.ref4UploadButton.setBtnDisable(true);
      }
    });
    if (this.$checkUserPermission(window.userId, MODULE_TYPE.SCRIPT_PARSE)) {
      [this.lstItemsVendorOrigin, this.lstItemsVendorScript, this.lstItemsVendorEos].forEach(array => array.push({dataType: 0, label: this.$l('L.I_SDM_NMS_SCRIPTS')}));
    }
    this.reactModeWatcher = this.$watch(
      () => this.switchReact,
      (newVal) => {
        if (!newVal) {
          this.initUpload();
        }
      },
      { immediate: true }
    );
    this.Hierarchy.loadHa();
  },
  beforeUnmount() {
    // region custom
    this.reactModeWatcher();
    this.titles4FileMgr = null;
    this.rows4FileMgr = null;
    this.lstItemsVendor = null;
    this.lstItemsVendorOrigin = null;
    this.lstItemsTimeSlotOrigin = null;
    this.lstItemsVendorScript = null;
    this.lstItemsVendorTemplate = null;
    this.lstItemsVendorAlarm = null;
    this.lstItemsVendorEos = null;
    // endregion
  },
  methods: {
    onClickHuaweiScriptCancel: function () {
      this.showHuaweiScriptConflict = false;
    },
    onClickHuaweiScriptConfirm: function () {
      this.showHuaweiScriptConflict = false;
      if (this.huaweiScriptConflictFilePath !== '') {
        window.downloadModule.download_user_defined_file(this.huaweiScriptConflictFilePath, window.projectId, window.productType);
        // 移除解析进度
        this.Api.appSwapApi.parsedataservice.cancelParsePro(this.debug, { projectId: window.projectId, curUserId: window.userId }, {}, (response) => {
          // empty function
        });
      }
    },
    _showGtsPage() {
      showGtsPage(this.debug);
    },

    // 确认解析覆盖EOS业务
    onClick4EosParseOk() {
      const self = this;
      this.showComfirm4EosParse = false;
      self.param4EosParse.fileInfo['coverData'] = true;

      this.startParseByPost(self.param4EosParse, function (result) {
        if (result) {
          self._getProgressByPost(function (oParseRes) {
            self._finishParseCallback(oParseRes);
          });
        } else {
          self.closeQueryParseStatus();
        }
      });
    },

    // 取消解析覆盖EOS业务
    onClick4EosParseCancel() {
      this.showComfirm4EosParse = false;
    },

    // 查询是否开启防呆设置
    queryParseAndSearchDefensiveState: function () {
      var self = this;
      if (this.debug) {
        self.classforIcon = 'blue';
      } else {
        this.Hierarchy.hierarchy('ScriptParsing', 'ScriptParsing');
        var oParam = { projectId: window.projectId };
        this.httpUtil.postJson(window.restWebRoot + '/WSSystemSettingsService/queryParseAndSearchDefensiveState', oParam, {}).then(
          function (response) {
            if (String(response) === '1') {
              self.classforIcon = 'blue';
            } else {
              self.classforIcon = 'grep';
            }
          },
          (response) => {
            // empty function
          },
        );
      }
    },

    setParseAndSearchDefensive: function () {
      if (!this.debug && !(this.$checkUserPermission(window.userId, MODULE_TYPE.TRAIL_SEARCH))) {
        return;
      }
      this.classforIcon = this.classforIcon == 'blue' ? 'grey' : 'blue';
      var parseAndSearchDefensive;
      if (this.classforIcon == 'blue') {
        parseAndSearchDefensive = 1;
      } else {
        parseAndSearchDefensive = 0;
      }
      if (this.debug) {
        if (this.classforIcon == 'blue') {
          this.$showPrompt({ status: '1', content: '解析和路径搜索防呆已开启' });
        } else {
          this.$showPrompt({ status: '2', content: '解析和路径搜索防呆已关闭' });
        }
      } else {
        var oParam = {
          projectId: window.projectId,
          parseAndSearchDefensive: parseAndSearchDefensive,
        };
        this.httpUtil.postJson(window.restWebRoot + '/WSScriptDataMgrSecondService/setParseAndSearchDefensive', oParam, {}).then(
          (response) => {
            // empty function
          },
          (response) => {
            // empty function
          },
        );
      }
    },

    init(oCallback) {
      // 1.下载模板中英文时候表格高度变化和radio初始状态
      const curLan = this.debug == true ? 'zh_CN' : window.curLanguage;
      this.height4DownloadTemplate = curLan == 'zh_CN' ? 380 : 420;
      this.$refs.ref1.setStatus(true, false);

      // 2.初始化解析用到判断的一些变量。默认进来时，需要查询当前的解析进度，用于恢复
      this.currentParseFileName = '';
      this.onloadQuery = true; // 保留以前的处理（具体原因需要结合后台考虑）
      this.verifyDataConsistencyFlag = false;

      // 3.根据解析类型 调用不同的方法进行进度恢复
      const typeStr = this.findParent(this, 'providerParseRes').providerParseRes().currentParseType;
      // 脚本解析切换到模板解析后，关闭脚本解析的查询进度定时器
      if (['template', 'site', 'portAlarm'].includes(typeStr) && this.timer4Script) {
        MarvelTimer.endTimer(this.timer4Script);
      }
      if (typeStr == 'script') {
        this.parseRecovery();
      } else if (typeStr == undefined) {
        this.parseRecovery('template');
        this.parseRecovery('site');
        this.parseRecovery('portAlarm');
        this.parseRecovery();
      } else {
        this.parseRecovery(typeStr);
      }

      // 4.获取文件列表的数据
      this._getFileList();

      // 5.获取防呆设置值
      this.queryParseAndSearchDefensiveState();

      // 华为网管脚本预解析完之后点击解析，触发解析方法
      if (oCallback) {
        oCallback();
      }
    },

    _getFileList: function () {
      var self = this;

      // 1.gen Param
      let oParam = this.genParam4GetFileList(1, this.perPageNum);
      // 2.post
      this.getFileListByPost(oParam, function (data) {
        // 3.1set curPAge
        self.$refs.ref4FileListGrid?.setCurPage(1);
        // 3.将后台返回的数据存到表格里面
        self.saveFileListVoToRows(data);
      });
    },
    genParam4GetFileList: function (pageIndex, pageSize) {
      return {
        page: {
          rows: pageSize,
          page: pageIndex,
        },
        sidx: '',
        sord: 'asc',
        projectId: window.projectId,
        timeZone: window.timeZone,
        locale: window.curLanguage,
      };
    },
    getFileListByPost: function (oParam, oCallback) {
      var self = this;
      if (this.debug) {
        var oFileList = CommonUtils.getMockData4GetFileList();
        self.totalNum4FileList = 5;
        self.totalPage4FileList = 1;
        oCallback(oFileList);
      } else {
        this.httpUtil.postJson(window.restWebRoot + '/WSScriptDataMgrSecondService/queryDataUploadHistory', oParam, {}).then(
          (response) => {
            self.totalNum4FileList = response.page.records;
            self.totalPage4FileList = response.page.total;
            oCallback(response);
          },
          (response) => {
            // empty function
          },
        );
      }
    },
    saveFileListVoToRows: function (data) {
      var self = this;
      if (this.debug) {
        this.rows4FileMgr = data;
      } else {
        this.rows4FileMgr = CommonUtils.transferServiceData4FileLstGrid(data, this);
        this.updateGlobalTargetTimeSlot();
        this.$nextTick(()=> { // 已经同步过数据脚本的体验项目不可再同步数据脚本
          if (this.rows4FileMgr.length > 0) {
            this.$refs.ref4UploadDemoProject?.setBtnDisable(true);
          }
        });
      }
    },
    onPageChange4FileList: function (iPageIndex, perPageNum) {
      var self = this;

      // 1.gen Param
      let oParam = this.genParam4GetFileList(iPageIndex, perPageNum);
      // 2.post
      this.getFileListByPost(oParam, function (data) {
        // 3.将后台返回的数据存到表格里面
        self.saveFileListVoToRows(data);
      });
    },
    onPerPageNumChange: function (perPageNum) {
      this.perPageNum = perPageNum;
      this._getFileList();
    },

    // region parse recovery
    parseRecovery(typeStr) {
      // typeStr不存在时，为脚本解析，存在为模板解析
      const self = this;
      if (this.debug) {
        return;
      }
      // 发一次请求，根据返回值，恢复解析进度展示
      this.queryParseProgressByPost(function (data) {
        const resultCode = data.messCode;
        const resultPro = data.proStr;

        if ([-2, 3, 4, 8, 18, 21, 22, 79].includes(resultCode) || ['0', '100'].includes(resultPro)) {
          // -2：未知错误
          // 3：操作成功
          // 4：操作失败
          // 8：通讯失败
          // 18：解析完成，脚本数据有错误
          // 21：一致性校验完成，是相同数据
          // 22：CSV模板数据错误，需要手工确认
          // 79：该脚本文件含有非法数据，请根据错误信息提示检查修改后重新上传解析
          // 进度0或者100必须在resultCode判断完才能作为判断条件
          self.closeQueryParseStatus();
          self._getFileList();
          return;
        }

        if (resultCode === 47) {
          if (self.isShowHuaweiScriptConflict === false) {
            self.huaweiScriptConflictFilePath = data.filePath;
            self.showHuaweiScriptConflict = true;
            self.isShowHuaweiScriptConflict = true;
          }
          self.closeQueryParseStatus(self.timer4Script);
          self._getFileList();
          return;
        }

        // 解决处理完冲突后没有做 一致性校验的问题
        const oParam = {
          userId: window.userId,
          projectIdStr: window.projectId,
          fileName: data.fileName,
          parseType: data.parseType ? data.parseType : '0',
        };

        if (typeStr) {
          // 模板解析
          oParam.parseType = '100';
          if (resultPro <= 95 && !data.isVervity) {
            if (resultCode === 75 && self.verifyDataConsistencyFlag == false) {
              self.verifyDataConsistencyFlag = true;
              self._verifyDataConsistencyByPost(oParam, (response) => {
                // empty function
              });
            }
            self._getTemplateProgressByPost(typeStr, function (oParseRes) {
              self._finishParseCallback(oParseRes);
              self._getFileList();
            });
          }
        } else {
          // 脚本解析
          if (resultCode === 75) {
            self._verifyDataConsistencyByPost(oParam, (response) => {
              // empty function
            });
          }
          self._getProgressByPost(function (oParseRes) {
            self._finishParseCallback(oParseRes);
            self._getFileList();
          });
        }
      });
    },
    // endregion

    // region tip Area
    onClick4ScriptShortTool: function () {
      let curLan = this.debug == true ? 'zh_CN' : window.curLanguage;
      if (curLan == 'zh_CN') {
        // 链接 'http://3ms.huawei.com/hi/group/3445/thread_7474219.html?mapId=9244147'
        window.open(atob('aHR0cDovLzNtcy5odWF3ZWkuY29tL2hpL2dyb3VwLzM0NDUvdGhyZWFkXzc0NzQyMTkuaHRtbD9tYXBJZD05MjQ0MTQ3'));
      } else {
        // 链接 'http://3ms.huawei.com/hi/group/3445/thread_7474219.html?mapId=9244147'
        window.open(atob('aHR0cDovLzNtcy5odWF3ZWkuY29tL2hpL2dyb3VwLzM0NDUvdGhyZWFkXzc0NzQyMTkuaHRtbD9tYXBJZD05MjQ0MTQ3'));
      }
    },
    // region parse base
    onClick4ViewParseBase: function () {
      let curLan = this.debug == true ? 'zh_CN' : window.curLanguage;
      if (curLan == 'zh_CN') {
        // 链接 'http://3ms.huawei.com/hi/group/3445/thread_7078979.html?mapId=8821683&for_statistic_from=all_group_forum'
        window.open(
          atob('aHR0cDovLzNtcy5odWF3ZWkuY29tL2hpL2dyb3VwLzM0NDUvdGhyZWFkXzcwNzg5NzkuaHRtbD9tYXBJZD04ODIxNjgzJmZvcl9zdGF0aXN0aWNfZnJvbT1hbGxfZ3JvdXBfZm9ydW0='),
        );
      } else {
        // 链接 'http://3ms.huawei.com/hi/group/3445/thread_7285817.html?mapId=9042795'
        window.open(atob('aHR0cDovLzNtcy5odWF3ZWkuY29tL2hpL2dyb3VwLzM0NDUvdGhyZWFkXzcyODU4MTcuaHRtbD9tYXBJZD05MDQyNzk1'));
      }
    },
    // endregion

    // region template
    onClickDialogCloseDownloadTemplate: function () {
      this.showDialog4DownloadTemplate = false;
    },

    onClick4DownloadTemplateFile: function () {
      var self = this;
      var selectFileType = this.$refs.ref1.getCheckItem();
      // 1.loading
      this.$showLoading({
        key: 'ImportExFileMgrDownloadTemplate',
        strMsg: self.$l('L.I_DOWNLOAD_TEMPLATE_LOADING'),
      });
      // 2.genParam4 download template file
      var oParam = this.genParam4DownloadFile(selectFileType);
      // 3.post
      this._downloadFile(oParam, function (strUrl) {
        // 4.关闭loading 下载文件
        self.$hideLoading({ key: 'ImportExFileMgrDownloadTemplate' });
        self._getFilePath(strUrl);
        self.showDialog4DownloadTemplate = false;
      });
    },

    onClick4Download: function () {
      this.showDialog4DownloadTemplate = true;
    },

    // endregion

    // region guide

    onClick4DownloadGuide: function () {
      let curLan = this.debug == true ? 'zh_CN' : window.curLanguage;
      if (curLan == 'zh_CN') {
        // 链接 'http://3ms.huawei.com/hi/group/3445/thread_7054501.html?mapId=8795201&for_statistic_from=all_group_forum'
        window.open(
          atob('aHR0cDovLzNtcy5odWF3ZWkuY29tL2hpL2dyb3VwLzM0NDUvdGhyZWFkXzcwNTQ1MDEuaHRtbD9tYXBJZD04Nzk1MjAxJmZvcl9zdGF0aXN0aWNfZnJvbT1hbGxfZ3JvdXBfZm9ydW0='),
        );
      } else {
        // 链接 'http://3ms.huawei.com/hi/group/3445/thread_7057425.html?mapId=8798395&for_statistic_from=all_group_forum'
        window.open(
          atob('aHR0cDovLzNtcy5odWF3ZWkuY29tL2hpL2dyb3VwLzM0NDUvdGhyZWFkXzcwNTc0MjUuaHRtbD9tYXBJZD04Nzk4Mzk1JmZvcl9zdGF0aXN0aWNfZnJvbT1hbGxfZ3JvdXBfZm9ydW0='),
        );
      }
    },

    onClick4DownloadGuideThirdParty: function () {
      let curLan = this.debug == true ? 'zh_CN' : window.curLanguage;
      if (curLan == 'zh_CN') {
        // 链接 'http://3ms.huawei.com/hi/group/3445/thread_7056681.html?mapId=8797589&for_statistic_from=all_group_forum'
        window.open(
          atob('aHR0cDovLzNtcy5odWF3ZWkuY29tL2hpL2dyb3VwLzM0NDUvdGhyZWFkXzcwNTY2ODEuaHRtbD9tYXBJZD04Nzk3NTg5JmZvcl9zdGF0aXN0aWNfZnJvbT1hbGxfZ3JvdXBfZm9ydW0='),
        );
      } else {
        // 链接 'http://3ms.huawei.com/hi/group/3445/thread_7057251.html?mapId=8798201&for_statistic_from=all_group_forum'
        window.open(
          atob('aHR0cDovLzNtcy5odWF3ZWkuY29tL2hpL2dyb3VwLzM0NDUvdGhyZWFkXzcwNTcyNTEuaHRtbD9tYXBJZD04Nzk4MjAxJmZvcl9zdGF0aXN0aWNfZnJvbT1hbGxfZ3JvdXBfZm9ydW0='),
        );
      }
    },
    // endregion

    // region common
    genParam4DownloadFile: function (strFileType) {
      var oParam = {
        prjId: '',
        userId: '',
        fileType: strFileType,
      };
      return oParam;
    },
    _downloadFile: function (oParam, oCallback) {
      if (this.debug) {
        setTimeout(function () {
          var oParam4GetFile = {
            url: '',
          };
          oCallback(oParam4GetFile.url);
        }, 2000);
      } else {
        var url = '';
        if (oParam.fileType == this.$l('L.I_TEMPLATE_NELINK')) {
          url = window.webRoot + '/template/NeAndLinkAndCardAndCrossTemplate.xlsx';
        } else if (oParam.fileType == this.$l('L.I_TEMPLATE_SITE')) {
          // 区分中英文英文模板
          if (window.curLanguage == 'zh_CN') {
            url = window.webRoot + '/template/SiteNECorrespondenceTemplateZh.xlsx';
          } else {
            url = window.webRoot + '/template/SiteNECorrespondenceTemplateEn.xlsx';
          }
        } else {
          url = window.webRoot + '/template/NePortAlarmTemplate.xlsx';
        }
        oCallback(url);
      }
    },
    // endregion

    // endregion

    // region upload

    // region upload dialog show

    onClick4UploadShow: function () {
      this._updateMem4ShowDialog();
    },
    onClick4UploadDemoProject() {
      this.$refs.ref4DemoProjectType.setSelectItem('');
      this.showDialog4DemoProject = true;
    },
    confirm4DemoProjectDialog() {
      const selectedKey = this.$refs.ref4DemoProjectType.getSelectItemObj().value;
      if (selectedKey) {
        this.query4UploadDemoProject(selectedKey);
      } else {
        this.$showPrompt({ status: '2', content: this.$l('L.DEMO_PROJECT_DATA_UPLOAD_TIP') });
      }
      this.showDialog4DemoProject = false;
    },
    cancel4DemoProjectDialog() {
      this.showDialog4DemoProject = false;
      this.$refs.ref4DemoProjectType.setSelectItem('');
    },
    query4UploadDemoProject(selectedKey) {
      this.$showLoading({ key: 'UploadCheckFile', strMsg: this.$l('L.PARSING_DATA_PROMPT') });
      const param = {
        userId: window.userId,
        projectId: window.projectId,
      };
      const body = {
        userId: window.userId,
        projectId: window.projectId,
        fileType: selectedKey,
      };
      this.Api.appSwapApi.demoproject.prefabricate(this.debug, body, param, (response) => {
        if (response.filePath) {
          let oParam2 = {
            fileInfo: { uploadId: response.uploadId },
            projectId: window.projectId,
            locale: window.curLanguage,
            curUserId: window.userId,
          };
          const timer = MarvelTimer.startTimer(() => {
            httpUtil.postJson(window.restWebRoot + '/WSScriptDataMgrSecondService/queryUploadPro', oParam2, {}).then((resp) => {
              if (resp.proStr === '100') {
                this.$hideLoading({ key: 'UploadCheckFile' });
                MarvelTimer.endTimer(timer);
                this._getFileList();
                this.$refs.ref4UploadDemoProject.setBtnDisable(true); // 同步成功后不可再同步
              }
            });
          }, Number('1000'));
        }
      });
    },
    // endregion
    onClick4UploadShowBaseData: function () {
      this.$refs.ref4ImportExUploadBaseData.showBaseDataDialogMethod();
    },
    // region selectFile

    onSelectFileBtnClick: function (oFile) {
      var self = this;
      if (this.debug) {
        var file = this.$refs.ref4Upload.getFile();
        this.fileName = file.name;
      } else {
        var fileNameArr = window.uploadModule.getSelectedFileNames('sdm');
        if (fileNameArr != undefined && fileNameArr.length > 0) {
          this.fileName = fileNameArr[0];
        } else {
          return;
        }
      }
      if (this.fileName == undefined) {
        this.showOverride = true;
        this.uploadInfo = self.$l('L.I_UPLOAD_EXTEND_INFO');
        return;
      }
      // 根据选择文件的类型改变下拉菜单的内容
      if (this.fileName.toLowerCase().lastIndexOf('.zip') !== -1) {
        this.lstItemsVendor = self.lstItemsVendorScript;
        this.fillTimeSlotDropdown(self.lstItemsTimeSlotOrigin, self.$l('L.I_SDM_HW_MODE'));
        this.disable = '';
        if (this.fileName.toLowerCase().lastIndexOf('alarm') !== -1 || this.fileName.lastIndexOf('告警') !== -1) {
          this.fillVendorDropdown(self.lstItemsVendorAlarm, self.$l('L.I_HUAWEI_ALARM'));
        } else if (this.fileName.toLowerCase().lastIndexOf('eos') !== -1 || this.fileName.lastIndexOf('Checking Service Volume') !== -1) {
          this.fillVendorDropdown(self.lstItemsVendorEos, self.$l('L.DESPECT_EOS_BUSINESS_TEMPLETE'));
        } else {
          this.fillVendorDropdown(self.lstItemsVendorScript, self.$l('L.I_SDM_NMS_SCRIPTS_DW'));
        }
      } else if (this.fileName.toLowerCase().lastIndexOf('.xls') !== -1) {
        this.lstItemsVendor = self.lstItemsVendorTemplate;
        this.fillTimeSlotDropdown(self.lstItemsTimeSlotNull, '-');
        this.disable = 'disable';
        if (this.fileName.lastIndexOf('SiteNECorrespondenceTemplate') !== -1) {
          this.fillVendorDropdown(self.lstItemsVendorTemplate, self.$l('L.I_SDM_SITE_TEMPLATE'));
        } else {
          this.fillVendorDropdown(self.lstItemsVendorTemplate, self.$l('L.I_SDM_NETWORK_TEMPLATE'));
        }
      }

      this.showOverride = false;
      this.saveMethodTip = false;
      this.height385 = 340;
      for (var i = 0; i < this.rows4FileMgr.length; i++) {
        if (
          this.fileName.substr(0, this.fileName.lastIndexOf('.')) == this.rows4FileMgr[i][2].value.substr(0, this.rows4FileMgr[i][2].value.lastIndexOf('.')) &&
          this.fileName.substr(this.fileName.lastIndexOf('.') + 1).toLowerCase() == this.rows4FileMgr[i][3].value.toLowerCase()
        ) {
          this.showOverride = true;
          this.uploadInfo = self.$l('L.I_UPLOAD_REPEAT_INFO');
          break;
        }
      }
    },

    fillVendorDropdown(paramLst, paramStr) {
      paramLst.forEach((item) => {
        item.active = false;
        if (item.label === paramStr) {
          item.active = true;
        }
      });
      this.dropDownItems4Vendor = paramLst;
    },

    fillTimeSlotDropdown: function (paramLst, paramStr) {
      paramLst.forEach(function (item) {
        item.active = false;
        if (item.label == paramStr) {
          item.active = true;
          item.select = true;
        }
      });
      this.dropDownItems4TimeSlot = paramLst;
      if (paramStr == this.$l('L.I_SDM_HW_MODE')) {
        this.inputMsg4TimeSlotMode = 0;
      } else if (paramStr == this.$l('L.I_SDM_LUCENT_MODE')) {
        this.inputMsg4TimeSlotMode = 1;
      }
    },

    // endregion

    // region vendor select

    onVendorOptionsSelectClick: function () {
      var dataType = this.$refs.ref4ButtonDropDownVendor.getSelectItemObj().dataType;
      if ([15, 16, 17, 101, 120, 134].includes(dataType)) {
        this.disable = 'disable';
        this.fillTimeSlotDropdown(this.lstItemsTimeSlotNull, '-');
      } else if ([0, 19, 30, 200].includes(dataType)) {
        this.disable = '';
        this.fillTimeSlotDropdown(this.lstItemsTimeSlotOrigin, this.$l('L.I_SDM_HW_MODE'));
      } else if ([4].includes(dataType)) {
        this.disable = 'disable';
        this.fillTimeSlotDropdown(this.lstItemsTimeSlotOrigin, this.$l('L.I_SDM_HW_MODE'));
      } else {
        this.disable = 'disable';
        this.fillTimeSlotDropdown(this.lstItemsTimeSlotOrigin, this.$l('L.I_SDM_LUCENT_MODE'));
      }
      if ([1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 20, 21].includes(dataType)) {
        // 三方脚本解析提示
        this.saveMethodTip = true;
        var curLan = this.debug == true ? 'zh_CN' : window.curLanguage;
        this.height385 = curLan == 'zh_CN' ? 385 : 420;
      } else {
        this.saveMethodTip = false;
        this.height385 = 340;
      }
    },

    updateGlobalTargetTimeSlot() {
      if (!this.rows4FileMgr) {
        return;
      }
      let fileList = this.rows4FileMgr;
      let parsedFlag = false;
      let item;

      for (let i = 0; i < fileList.length; i++) {
        for (let j = 0; j < fileList[i].length; j++) {
          item = fileList[i][j];
          if (item.key === 'parseStatus' && item.value === this.$l('L.I_PARSE_PARSED')) {
            parsedFlag = true;
            break;
          }
        }
        if (parsedFlag) {
          this.globalTargetTimeSlot = this.getTimeSlotFromRow(fileList[i]);
          break;
        }
      }
    },

    // endregion

    // region upload ok click

    onClick4UploadOK: function () {
      var self = this;

      // 1.检查上传的参数选择是否正确
      this._checkUploadSelectPara(
        function (result) {
          if (result.resultCode == 0 || result.resultCode == 1) {
            // 1.更新控制覆盖上传的参数
            self.parseFlagInUpload = result.resultCode !== 1;
            // 2.关闭上传对话框
            self._closeUploadDiaglog();
            // 3.开始上传的post请求
            self._startUploadByPost();
          } else {
            self.$showPrompt({
              status: '2',
              content: result.resultMess,
            });
          }
        },
        function (strErrorInfo) {
          // 1.在界面显示错误信息
          self._uploadSelectParaError(strErrorInfo);
        },
      );
    },

    afterUploadToFsOK: function (successInfo, clientId) {
      var self = this;
      if (clientId == 'sdm') {
        var oParam = {
          fileInfo: {
            fileName: self.fileName,
            uploadId: successInfo[self.fileName].fileId,
            remark: self.inputMsg4Remark,
            parseFlag: self.parseFlagInUpload,
            dataType: self.inputMsg4Vendor,
            collectMode: self.inputMsg4CollectMode,
            timeSlot: self.inputMsg4TimeSlotMode,
          },
          projectId: window.projectId,
          curUserId: window.userId,
          locale: window.curLanguage,
        };
        self._saveUploadFileByPost(oParam, function (result) {
          if (result.resultCode == 0 || result.resultCode == 1) {
            var oParam2 = {
              fileInfo: { uploadId: successInfo[self.fileName].fileId },
              projectId: window.projectId,
              locale: window.curLanguage,
              curUserId: window.userId,
            };
            self._getUploadProgress(oParam2, function () {
              // 5.上传完成，获取文件列表
              self._getFileList();
            });
          } else {
            self.uploadStatus = 'finish';
            self.$refs.refMiniLoading.hideEx();
            self.$showPrompt({
              status: '2',
              content: result.resultMess,
            });
          }
          self.$refs.ref4UploadButton.setBtnDisable(false);
        });
      }
    },

    _saveUploadFileByPost: function (oParam, oCallback) {
      if (!this.debug) {
        this.httpUtil.postJson(window.restWebRoot + '/WSScriptDataMgrSecondService/saveUploadFile', oParam, {}).then(
          (response) => {
            oCallback(response);
          },
          (response) => {
            // empty function
          },
        );
      }
    },

    _checkFileByNameByPost: function (oCallback) {
      if (this.debug) {
        var res = {
          resultCode: 1,
        };
        oCallback(res);
      } else {
        var oParam = {
          projectId: window.projectId,
          locale: window.curLanguage,
          fileInfo: { fileName: this.fileName },
        };
        this.httpUtil.postJson(window.restWebRoot + '/WSScriptDataMgrService/checkFileByName', oParam, {}).then(
          (response) => {
            oCallback(response);
          },
          (response) => {
            // empty function
          },
        );
      }
    },

    _checkUploadSelectPara(oAfterUploadParaCorrectCallback, oUploadParaErrorCallback) {
      if (this.debug) {
        var file = this.$refs.ref4Upload.getFile();
        this.fileName = file == undefined ? '' : file.name;
      } else {
        var fileNameArr = window.uploadModule.getSelectedFileNames('sdm');
        if (fileNameArr != undefined && fileNameArr.length > 0) {
          this.fileName = fileNameArr[0];
        }
      }
      // region check select para
      this.inputMsg4Remark = this.$refs.ref4Remark.getInputMsg();
      this.inputMsg4Vendor = this.$refs.ref4ButtonDropDownVendor.getSelectItemObj().dataType;

      let collectModeItems = CommonUtils.getCollectModeItems(this.inputMsg4Vendor, undefined);
      let timeSlotItems = CommonUtils.getTimeSlotItems(this.inputMsg4Vendor, undefined);

      collectModeItems.forEach(item => {
        if (item.selected === true) {
          this.inputMsg4CollectMode = item.collectMode;
        }
      });
      timeSlotItems.forEach(item => {
        if (item.selected === true) {
          this.inputMsg4TimeSlotMode = item.timeSlot;
        }
      });

      // ui check
      if (this.fileName == '' || this.fileName == undefined) {
        const strErrorInfo = this.$l('L.I_UPLOAD_NOFILE_INFO');
        oUploadParaErrorCallback(strErrorInfo);
      } else if (
        this.fileName.toLowerCase().lastIndexOf('.zip') == -1 &&
        this.fileName.toLowerCase().lastIndexOf('.xlsx') == -1 &&
        this.fileName.toLowerCase().lastIndexOf('.xls') == -1
      ) {
        const strErrorInfo = this.$l('L.I_UPLOAD_EXTEND_INFO');
        oUploadParaErrorCallback(strErrorInfo);
      } else {
        // service check
        this._checkFileByNameByPost(oAfterUploadParaCorrectCallback);
      }
    },
    _closeUploadDiaglog() {
      this.showDialog = false;
      this.showOverride = false;
    },
    _uploadSelectParaError(strErrorInfo) {
      this.showOverride = true;
      this.uploadInfo = strErrorInfo;
    },
    _startUploadByPost() {
      const self = this;
      this.uploadStatus = 'running';
      if (this.debug) {
        self._getUploadProgress({}, function () {
          self.$refs.ref4UploadButton.setBtnDisable(false);
          self._getFileList();
        });
      } else {
        var isSuccess = window.uploadModule.startUpload('sdm');
      }
    },

    _getUploadProgress: function (oParam, oCallback) {
      var self = this;

      if (this.debug) {
        var i = 1;
        const timer = MarvelTimer.startTimer(function () {
          // 每次查询进度信息，如果返回值的状态标示上传取消，则不执行后面的回调
          if (i < 4) {
            self.$refs.refMiniLoading.setProgress(10 * i, self.$l('L.I_UPLOADING'));
          } else if (i == 4) {
            self.$refs.refMiniLoading.setProgress(100, self.$l('L.I_UPLOAD_FINISH'));
            self.$refs.refMiniLoading.hideEx();
            self.uploadStatus = 'finish';
            MarvelTimer.endTimer(timer);
            oCallback();
          }
          i++;
        }, self.timerIntervel);
      } else {
        const timer = MarvelTimer.startTimer(function () {
          self.httpUtil.postJson(window.restWebRoot + '/WSScriptDataMgrSecondService/queryUploadPro', oParam, {}).then(function (response) {
            if (response.messCode == 3) {
              self.$refs.refMiniLoading.setProgress(100, self.$l('L.I_SAVEDATA_FINISH'));
              self.uploadStatus = 'finish';
              self.$refs.refMiniLoading.hideEx();
              MarvelTimer.endTimer(timer);
              oCallback();
            } else if (response.messCode == 0) {
              self.$refs.refMiniLoading.setProgress(response.proStr, self.$l('L.I_SAVING_FILE'));
            } else if (response.messCode == 4) {
              // 改;
            } else {
              self.uploadStatus = 'finish';
              self.$refs.refMiniLoading.hideEx();
              MarvelTimer.endTimer(timer);
              self.$showPrompt({
                status: '2',
                content: response.messStr,
              });
            }
          });
        }, self.timerIntervel);
      }
    },

    // endregion

    // region upload dialog close

    onClick4UploadCancel: function () {
      this._updateMem4UploadCancel();
    },
    onClickDialogClose: function () {
      this._updateMem4UploadCancel();
    },

    // endregion

    // region common

    _updateMem4ShowDialog: function () {
      var self = this;
      this.showDialog = true;
      this.showOverride = false;
      this.saveMethodTip = false;
      this.fileName = undefined;
      this.inputMsg4Remark = '';
      this.height385 = 340;
      // region dropdown
      this.disable = '';
      this.inputMsg4Vendor = '';
      this.inputMsg4CollectMode = '';
      this.inputMsg4TimeSlotMode = '';
      this.$nextTick(function () {
        this.fillVendorDropdown(this.lstItemsVendorOrigin, this.$l('L.I_SDM_NMS_SCRIPTS_DW'));
        this.fillTimeSlotDropdown(this.lstItemsTimeSlotOrigin, this.$l('L.I_SDM_HW_MODE'));
        if (self.debug == false) {
          window.uploadModule.init({
            config: {
              projectId: window.projectId,
              userId: window.userId,
              productType: window.productType,
            },
            fileTypes: '*.*',
            fileSize: 1024,
            clientId: 'sdm',
            browserButtonId: 'selectPathScript',
            isSingleFile: true,
          });
        }
      });
      // endregion
    },
    _updateMem4UploadCancel: function () {
      this.showOverride = false;
      this.saveMethodTip = false;
      this.fileName = undefined;
      this.showDialog = false;
      this.inputMsg4Remark = '';
      // region dropdown
      this.inputMsg4Vendor = '';
      this.inputMsg4CollectMode = '';
      this.inputMsg4TimeSlotMode = '';
      // endregion
    },

    // endregion

    // endregion

    // region fileLst
    onClick4FileListGrid: function (oRow) {
      this.$refs.ref4FileListGrid.setRowColor(oRow[0].value);
    },

    // region edit remark
    editFileRemarkFinishedEx: function (oRow, oCell, oOldVal, oNewVal, oAfterCallback) {
      if (this.debug) {
        this.$showPrompt({ status: '1', content: 'edit remark info' });
        oAfterCallback();
      } else {
        var oParam = {
          // 原始数据整个对象保存在表格的数据结构中最后一列
          fileInfo: {
            uploadId: oRow[15].value.uploadId,
            remark: oNewVal,
          },
          projectId: window.projectId,
          locale: window.curLanguage,
        };
        this.httpUtil.postJson(window.restWebRoot + '/WSScriptDataMgrSecondService/updateFileRemark', oParam, {}).then(
          (response) => {
            oAfterCallback(response.resultCode);
          },
          (response) => {
            // empty function
          },
        );
      }
    },
    // endregion

    // region dropdown select
    onOptionChangeDataTypeOrTimeSlot: function (oRow, oCell, strOldValue, strNewValue) {
      if (oCell.key == 'dataType') {
        let dataType = this.getDataTypeFromRow(oRow);
        oRow[10].value = CommonUtils.getCollectModeItems(dataType, undefined);
        oRow[11].value = CommonUtils.getTimeSlotItems(dataType, undefined);
      }

      this.modifyDataTypeOrTimeSlotByPost(oRow);
    },

    modifyDataTypeOrTimeSlotByPost: function (oRow) {
      if (!this.debug) {
        let dataType = this.getDataTypeFromRow(oRow);
        let collectMode = this.getCollectModeFromRow(oRow);
        let timeSlot = this.getTimeSlotFromRow(oRow);
        let oParam = {
          projectId: window.projectId,
          locale: window.curLanguage,
          fileInfo: {
            uploadId: oRow[15].value.uploadId,
            dataType: dataType,
            collectMode: collectMode,
            timeSlot: timeSlot,
          },
        };
        this.httpUtil.postJson(window.restWebRoot + '/WSScriptDataMgrSecondService/updateFileInfos', oParam, {}).then(
          (response) => {
            // empty function
          },
          (response) => {
            // empty function
          },
        );
      }
    },
    // endregion

    // region cellClick

    onGridRowIconClick(oRow, oCell, oIcon) {
      const self = this;
      if (oCell.key == 'delete') {
        if (this.parseStatus.includes('running') && oRow[2].value == self.currentParseFileName) {
          self._promptInfo('2', self.$l('L.I_PARSE_DONT_DELETE'));
        } else {
          this.showDialog4DeleteFile = true;
          this.currentSelectRow = oRow;
          this.deleteFileTip = this.$l('L.I_DELETE_TIP') + " '" + oRow[2].value + "'?";
        }
      } else if (oCell.key == 'download') {
        // 1.loading
        this.$showLoading({
          key: 'ImportExFileMgrDownLoad',
          strMsg: this.$l('L.I_PARSE_DOWNLOAD_DATA_LOADING'),
        });
        // 2.genParam4 delete file record
        const oParam = this.genParam4DownloadFileRecord(oRow);
        // 3.判断文件路径是否存在 (潜规则 用工程id)
        const filePath = oRow[15].value.filePath;

        const projectIdVal = this.debug ? 0 : window.projectId;
        if (filePath.lastIndexOf(projectIdVal) == -1) {
          self._promptInfo('2', self.$l('L.I_FILEPATH_ERROR'));
          self.$hideLoading({ key: 'ImportExFileMgrDownLoad' });
          return;
        }
        // 3.post
        this._downloadIconClick(oParam, (strUrl) => {
          // empty function
        });
      } else {
        // 点击的是解析
        // 校验操作人与上传人是否一致 不一致的话直接返回
        if (oRow[4].value !== window.userId) {
          // 弹窗提示
          this._promptInfo('2', self.$l('L.CURUSER_DIFF_UPLOADUSER'));
          return;
        }
        this._startParse(oRow);

        this.Hierarchy.hierarchy('ScriptParsing', 'DataParsing');
      }
    },

    // endregion

    // region deelet file
    onClick4DeleteFileCancel: function () {
      this.showDialog4DeleteFile = false;
    },

    onClick4DeleteFileOK: function () {
      var self = this;
      // 1.genParam4 delete file record
      var oParam = this.genParam4DelFileRecord(this.currentSelectRow);
      // 2. post
      this._deleteIconClick(oParam, function () {
        self._getFileList();
        self.showDialog4DeleteFile = false;
      });
    },
    // endregion

    // region parse click
    _startParse(oRow) {
      const self = this;
      this.verifyDataConsistencyFlag = false;
      this.isShowHuaweiScriptConflict = false;
      // step1 判断是否有其他解析任务
      if (this.parseStatus.includes('running')) {
        self._promptInfo('2', self.$l('L.I_PARSE_ERROR_UNDERPARSE'));
        return;
      }
      this.$refs.refMiniLoading4Parse.setProgress(0, self.$l('L.I_PARSING'));
      // step2 校验数据类型和目标时隙
      let dataTypeFromRow = this.getDataTypeFromRow(oRow);
      if (dataTypeFromRow == -1) {
        self.closeQueryParseStatus();
        self._promptInfo('2', self.$l('L.I_PARSE_ERROR_NONEDATATYPE'));
        return;
      }
      let timeSlotFromRow = this.getTimeSlotFromRow(oRow);
      if ([1, 2].includes(this.globalTargetTimeSlot) && [1, 2].includes(timeSlotFromRow) && this.globalTargetTimeSlot !== timeSlotFromRow) {
        self.closeQueryParseStatus();
        self._promptInfo('2', self.$l('L.I_PARSE_ERROR_TIMESLOT_CONFLICT'));
        return;
      }

      this.curParseVendor = dataTypeFromRow;
      const oParam = this.genParam4StartParse(oRow);

      // step3 开始解析
      if ([16, 17, 30, 31, 32].includes(dataTypeFromRow)) {
        // step3.1 模板解析
        this.Hierarchy.hierarchy('ScriptParsing', 'TemplateParsing');
        // step3.1.1 组装参数
        if (dataTypeFromRow === 17) {
          oParam.parseType = 5; // [ParseTypeEnum] 站点模板解析
          this.currentParseType =  'site';
        } else if (dataTypeFromRow === 30) {
          oParam.parseType = 30; // [ParseTypeEnum] huawei告警解析
          this.currentParseType =  'portAlarm';
        } else if (dataTypeFromRow === 31) {
          oParam.parseType = 31; // [ParseTypeEnum] 三方告警解析
          this.currentParseType =  'portAlarm';
        }  else if (dataTypeFromRow === 32) {
          oParam.parseType = 32; // [ParseTypeEnum] Eoo配置解析
          this.currentParseType =  'eooConfig';
        } else {
          oParam.parseType = 4; // [ParseTypeEnum] 网络资源模板解析
          this.currentParseType =  'template';
        }

        // step3.1.2 开始解析模板
        this.startParseByPost(oParam, function (result) {
          if (result) {
            // step3.1.3 查询解析进度
            self._getTemplateProgressByPost(self.currentParseType, (oParseRes) => {
              // step3.1.4 模板解析完成
              self._finishParseCallback(oParseRes);
            });
          } else {
            self.closeQueryParseStatus();
          }
        });
      } else {
        // step3.2 脚本解析
        if ([0, 200].includes(dataTypeFromRow) && this.isParseTrail === undefined) {
          // 预解析
          oParam.parseType = 0;
          self.startPreParse(oParam);
          this.currentSelectRow = oRow;
          return;
        }

        // step3.2.1 组装参数
        if (dataTypeFromRow === 0 && this.isParseTrail !== undefined) {
          oParam.parseType = 1; // [ParseTypeEnum] 华为脚本解析（已完成预解析）
        } else if (dataTypeFromRow === 200 && this.isParseTrail !== undefined) {
          oParam.parseType = 200; // [ParseTypeEnum] 数仓解析（已完成预解析）
        } else if (dataTypeFromRow === 15) {
          oParam.parseType = 7; // [ParseTypeEnum] 分组模板解析
        } else if (dataTypeFromRow === 135) {
          oParam.parseType = 8; // [ParseTypeEnum] 单站分组mml解析
        } else if (dataTypeFromRow === 136) {
          oParam.parseType = 9; // [ParseTypeEnum] 分组告警解析
        } else if (dataTypeFromRow === 137) {
          oParam.parseType = 10; // [ParseTypeEnum] 分组端口流量解析
        } else if (dataTypeFromRow === 19) {
          oParam.parseType = 3; // [ParseTypeEnum] EOS模板解析
          self.param4EosParse = oParam;
        } else if (dataTypeFromRow === 120) {
          oParam.fileInfo.parseType = 120;
          oParam.parseType = 120;
        } else if (dataTypeFromRow === 101) {
          oParam.fileInfo.parseType = 101;
          oParam.parseType = 101;
        } else if (dataTypeFromRow === Number('134')) {
          oParam.fileInfo.parseType = Number('134');
          oParam.parseType = Number('134');
        } else {
          oParam.parseType = 2; // [ParseTypeEnum] 第三方脚本解析
        }
        this.currentParseType = 'script';

        // step3.2.2 开始解析脚本
        this.startParseByPost(oParam, function (result) {
          if (result) {
            // step3.2.3 查询解析进度
            self._getProgressByPost(function (oParseRes) {
              // step3.2.4 脚本解析完成
              self._finishParseCallback(oParseRes);
            });
          } else {
            self.closeQueryParseStatus();
          }
        });
        this.isParseTrail = undefined;
      }
    },
    // endregion

    // region script parse
    getDataTypeFromRow(oRow) {
      let dataTypeFromRow = -1;
      if (!oRow || oRow.length < 9) {
        return dataTypeFromRow;
      }

      for (let i = 0; i < oRow[9].value.length; i++) {
        if (oRow[9].value[i].selected == true) {
          dataTypeFromRow = oRow[9].value[i].dataType;
          break;
        }
      }
      return dataTypeFromRow;
    },

    getCollectModeFromRow(oRow) {
      let collectModeFromRow = -1;
      if (!oRow || oRow.length < 10) {
        return collectModeFromRow;
      }

      for (let i = 0; i < oRow[10].value.length; i++) {
        if (oRow[10].value[i].selected == true) {
          collectModeFromRow = oRow[10].value[i].collectMode;
          break;
        }
      }
      return collectModeFromRow;
    },

    getTimeSlotFromRow(oRow) {
      let timeSlotFromRow = -1;
      if (!oRow || oRow.length < 11) {
        return timeSlotFromRow;
      }

      for (let i = 0; i < oRow[11].value.length; i++) {
        if (oRow[11].value[i].selected == true) {
          timeSlotFromRow = oRow[11].value[i].timeSlot;
          break;
        }
      }
      return timeSlotFromRow;
    },

    genParam4StartParse(oRow) {
      let dataTypeFromRow = this.getDataTypeFromRow(oRow);
      let collectModeFromRow = this.getCollectModeFromRow(oRow);
      let timeSlotFromRow = this.getTimeSlotFromRow(oRow);
      // 处理解析类型字段
      const deviceManufacturerMap = {
        1: 2,
        2: 3,
        5: 4,
        8: 5,
        9: 6,
        11: 7,
        3: 9,
        4: 10,
        12: 11,
        6: 12,
        7: 13,
        13: 14,
        10: 15,
        14: 255,
        20: 17,
        21: 18,
      };
      let parseType = 1;
      let deviceManufacturer = 0;
      if (dataTypeFromRow == 0) {
        parseType = 0;
        deviceManufacturer = 0;
      } else if (dataTypeFromRow == 200) {
        parseType = 200;
        deviceManufacturer = 0;
      } else if (dataTypeFromRow == 15) {
        parseType = 4;
        deviceManufacturer = 0;
      } else if (dataTypeFromRow == 4) {
        parseType = 2;
        deviceManufacturer = 10;
      } else if (dataTypeFromRow == 19) {
        // 迭代4
        parseType = 5;
        deviceManufacturer = 0;
      }  else if (dataTypeFromRow === 32) {
        // Eoo配置解析
        parseType = 32;
        deviceManufacturer = 0;
      } else {
        parseType = 1;
        deviceManufacturer = deviceManufacturerMap[dataTypeFromRow];
      }

      const oParam = {
        fileInfo: {
          userId: oRow[15].value.userId,
          fileName: oRow[15].value.fileName,
          uploadId: oRow[15].value.uploadId,
          parseType: parseType,
          deviceManufacturer: deviceManufacturer,
          collectMode: collectModeFromRow,
          timeSlot: timeSlotFromRow,
          lucent: timeSlotFromRow,
        },
        projectId: window.projectId,
        curUserId: window.userId,
        locale: window.curLanguage,
        isParseTrail: this.isParseTrail === true,
      };
      this.currentParseParam = oParam;
      return oParam;
    },

    // 下发解析请求
    startParseByPost(oParam, oCallback) {
      // 针对服务通讯异常，增加3次重试机会，防止微服务重启未完成时，触发解析任务，导致失败
      const retryInterval = 5000;
      retry(
        (value) => value.resultCode === Number('8'),
        retryInterval,
        () =>
          new Promise((resolve, reject) => {
            this.Api.parseDataApi.parseData.parseData(this.debug, oParam, {}, (response) => {
              resolve(response);
            });
          }),
      ).then((response) => {
        if (response) {
          let { resultCode } = response;
          if (resultCode === 0) {
            // 0：正在工作/解析
            oCallback(true);
          } else if (('5', '6', '12').includes(String(resultCode))) {
            // 5：正在解析其他文件
            // 6：正在解析同名文件
            // 12：该文件正在被解析
            this._promptInfo('2', response.resultMess);
            oCallback(true);
          } else if (resultCode === Number('8')) {
            // 8：服务器通讯失败
            this._promptInfo('2', this.$l('L.TIP_TRAIL_SERVER_ERROR'));
            oCallback(false);
          } else {
            this._promptInfo('2', response.resultMess);
            oCallback(false);
          }
        }
      });
    },

    // 下发查询解析进度请求
    queryParseProgressByPost(oCallback) {
      const self = this;

      if (this.debug) {
        const data = {
          messCode: 3,
          messStr: '',
          proStr: '100',
          boxCode: 0,
          userId,
          projectIdStr: window.projectId,
          fileName: this.fileName,
        };
        oCallback(data);
      } else {
        const oParam = {
          projectId: window.projectId,
          curUserId: window.userId,
          locale: window.curLanguage,
        };
        this.httpUtil.postJson(window.restWebRoot + '/WSParseDataService/queryParseProgress', oParam, {}).then(
          function (response) {
            if (response) {
              oCallback(response);
            }
          },
          function (response) {
            self.$refs.refMiniLoading4Parse.hideEx();
            self._promptInfo('2', self.$l('L.TIP_TRAIL_SERVER_ERROR'));
          },
        );
      }
    },

    _getProgressByPost(oCallback, flag) {
      const self = this;
      this.parseStatus = 'running';
      if (!flag) {
        this.$refs.refMiniLoading4Parse.setProgress(0, self.$l('L.I_PARSING'));
      }
      if (this.debug) {
        let i = 1;
        this.timer4Script = MarvelTimer.startTimer(function () {
          if (i < 3) {
            self.temporarilyHideEx = true;
            self.show4QueueArea = true;
            self.html4Queue = MarvelStr.format(self.$l('L.HW_SCRIPT_PARSE_LINE_UP_TIP'), 3 - i);
          } else if (i >= 3 && i < 8) {
            self.temporarilyHideEx = false;
            self.show4QueueArea = false;
            self.$refs.refMiniLoading4Parse.setProgress(10 * i, self.$l('L.I_PARSING'));
          } else if (i === 8) {
            self.$refs.refMiniLoading4Parse.setProgress(100, self.$l('L.I_PARSE_FINISH'));
            self.closeQueryParseStatus(self.timer4Script);
            var oParseRes = { messCode: 3 };
            oCallback(oParseRes);
          }
          i++;
        }, self.timerIntervel);
      } else {
        if (this.timer4Script) {
          // 脚本解析查询进度定时器存在时，先关闭再生成，防止重新生成后旧的定时器无法关闭
          MarvelTimer.endTimer(this.timer4Script);
        }
        this.timer4Script = MarvelTimer.startTimer(function () {
          self.queryParseProgressByPost(function (data) {
            const resultCode = data.messCode;
            const resultPro = data.proStr;
            const boxCode = data.boxCode;
            self.currentParseFileName = data.fileName;

            switch (resultCode) {
              case 0:
                // 正在解析
                self.parseStatus = 'running';
                // 判断resultPro，如果带 "-" 表示在排队，如果不带 "-" 表示正在解析
                if (resultPro.indexOf('-') === 0) {
                  self.temporarilyHideEx = true;
                  self.show4QueueArea = true;
                  self.html4Queue = MarvelStr.format(self.$l('L.HW_SCRIPT_PARSE_LINE_UP_TIP'), resultPro.substr(1));
                } else if (resultPro === '100') {
                  self.closeQueryParseStatus(self.timer4Script);
                } else {
                  self.show4QueueArea = false;
                  self.temporarilyHideEx = true;
                  self.$refs.refMiniLoading4Parse.setProgress(resultPro, self.$l('L.I_PARSING'));
                }
                break;
              case 3:
                // 操作成功
                self.$refs.refMiniLoading4Parse.setProgress(100, self.$l('L.I_PARSE_FINISH'));
                self.closeQueryParseStatus(self.timer4Script);
                oCallback(data);
                break;

              case 101:
                // 操作成功
                self.$refs.refMiniLoading4Parse.setProgress(100, self.$l('L.I_PARSE_FINISH'));
                self.closeQueryParseStatus(self.timer4Script);
                oCallback(data);
                break;
              case 5:
                // 正在解析其他文件
                self.parseStatus = 'running';
                self._promptInfo('2', self.$l('L.I_PARSING'));
                break;
              case 8:
                // 服务器通讯失败
                self.closeQueryParseStatus(self.timer4Script);
                if (self.onloadQuery == true) {
                  self.onloadQuery = false;
                } else {
                  oCallback(data);
                }
                break;
              case 13:
                // 文件数据不完整，请检查文件完整性，重新上传
                self._promptInfo('2', self.$l('L.PS_ILLEGAL_FILE'));
                self.closeQueryParseStatus(self.timer4Script);
                break;
              case 18:
                // 脚本数据存在错误
                // 暂时禁用此功能 self.showDialog4ScriptError = true;
                self.sdmMess = data;
                MarvelTimer.endTimer(self.timer4Script);
                self.onClick4ScriptErrorContinue();
                break;
              case 19: // 校验完成，存在冲突数据
              case 74: // 临时数据表有冲突数据，界面需要手式处理
                self.parseStatus = 'running';
                MarvelTimer.endTimer(self.timer4Script);
                oCallback(data);
                break;
              case 20: // 校验完成，没有冲突数据
              case 51: // 正在保存数据
              case 76: // 数据校验中
                self.parseStatus = 'running';
                self.$refs.refMiniLoading4Parse.setProgress(resultPro, self.$l('L.I_PARSING'));
                break;
              case 21:
                // 校验完成，是相同数据
                self.$refs.refMiniLoading4Parse.setProgress(100, self.$l('L.I_PARSE_FINISH'));
                self._promptInfo('2', self.$l('L.I_PARSE_ERROR_SAMESCRIPTS'));
                self.closeQueryParseStatus(self.timer4Script);
                self._getFileList();
                break;
              case 22: // CSV模板数据错误，需要手工确认
              case 79: // 该脚本文件含有非法数据，请根据错误信息提示检查修改后重新上传解析
                self._promptInfo('2', data.messStr);
                self.closeQueryParseStatus(self.timer4Script);
                oCallback(data);
                break;
              case 60:
                // 生成Excel网络资源模板成功
                if (boxCode == 10) {
                  self.parseStatus = 'running';
                  self.delBoxCodeRedis(data);
                  MarvelTimer.endTimer(self.timer4Script);
                  self.currentParseType = 'template';
                  // 由查询脚本解析进度为模板解析进度
                  self._getTemplateProgressByPost('thirdParty', function (oParseRes) {
                    oCallback(oParseRes);
                  });
                } else if (boxCode == 0) {
                  self.closeQueryParseStatus(self.timer4Script);
                }
                break;
              case 73:
                // 正在取消
                self.$refs.refMiniLoading4Parse.setProgress(resultPro, self.$l('L.TEXT_CANCEL'));
                break;
              case Number('75'): {
                // 进行数据校验
                self.parseStatus = 'running';
                let parseType = data.parseType;
                if (!parseType) {
                  parseType = '0';
                }
                const oParam = {
                  userId: data.userId,
                  projectIdStr: data.projectIdStr,
                  fileName: data.fileName,
                  parseType: parseType,
                };
                self._verifyDataConsistencyByPost(oParam, (response) => {
                  // empty function
                });
                break;
              }
              case 77:
                // 华为脚本解析保护交叉的pgid重复
                // 暂时屏蔽此功能 self.showDialog4PgID = true;
                MarvelTimer.endTimer(self.timer4Script);
                self.onClick4PgIdContinue();
                break;
              case 81:
                // 清空之前解析的EOS业务
                self.closeQueryParseStatus(self.timer4Script);
                self.showComfirm4EosParse = true;
                break;
              case 47:
                // 47: 脚本中存在华为脚本数据与工具中已解析的华为脚本数据存在网元名称相同网元原始id不同的情况
                if (self.isShowHuaweiScriptConflict === false) {
                  self.showHuaweiScriptConflict = true;
                  self.isShowHuaweiScriptConflict = true;
                  self.huaweiScriptConflictFilePath = data.filePath;
                }
                self.$refs.refMiniLoading4Parse.setProgress(100, self.$l('L.I_PARSE_NOT_PARSE'));
                self.closeQueryParseStatus(self.timer4Script);
                break;
              case 151:
                // 151:上传的解析文件中无数据
                self._promptInfo('2', self.$l('L.DCN_FILE_PARSE_ERROR_TIP1'));
                self.closeQueryParseStatus(self.timer4Script);
                break;
              case 152:
                // 152:没有有效的ECC数据
                self._promptInfo('2', self.$l('L.DCN_FILE_PARSE_ERROR_TIP2'));
                self.closeQueryParseStatus(self.timer4Script);
                break;
              default:
                self._promptInfo('2', data.messStr);
                self.closeQueryParseStatus(self.timer4Script);
                break;
            }
            self.onloadQuery = false;
          });
        }, self.timerIntervel);
      }
    },
    // endregion

    // region template parse
    _getTemplateProgressByPost(parseType, oCallback) {
      const self = this;
      this.parseStatus = 'running';
      if (parseType === 'template' || parseType === 'site' || parseType === 'portAlarm') {
        this.$refs.refMiniLoading4Parse.setProgress(0, self.$l('L.I_PARSING'));
      }
      if (this.debug) {
        let i = 1;
        const timer = MarvelTimer.startTimer(function () {
          if (i !== 5) {
            self.$refs.refMiniLoading4Parse.setProgress(10 * i, self.$l('L.I_PARSING'));
          } else {
            self.$refs.refMiniLoading4Parse.setProgress(100, self.$l('L.I_PARSE_FINISH'));
            self.closeQueryParseStatus(timer);
            const oParseRes = {
              proStr: '-1',
            };
            oCallback(oParseRes);
          }
          i++;
        }, self.timerIntervel);
      } else {
        const timer = MarvelTimer.startTimer(function () {
          self.queryParseProgressByPost(function (data) {
            if (data) {
              const resultCode = data.messCode;
              const resultPro = data.proStr;
              const vervity = data.isVervity;

              if (parseType !== 'portAlarm' && parseType !== 'thirdParty') {
                self.currentParseFileName = data.fileName;
              }

              if ([-2, 4, 7, 8, 23, 28, 53, 83, 84, 85, 45].includes(resultCode)) {
                // -2：未知错误
                // 4：操作失败
                // 7：模板文件格式错误，请在当前界面下载模板后重新上传解析
                // 8：通讯失败
                // 23/53：保存数据失败
                // 28: 文件数据缺失：无法获取正确的文件内容，请检查文件数据后再次尝试
                self._promptInfo('2', data.messStr);
                self.closeQueryParseStatus(timer);
              } else if (resultCode === -1) {
                // -1：文件正在解析，不能删除
                self.closeQueryParseStatus(timer);
              } else if (resultCode === 13) {
                // 13：文件数据不完整，请检查文件完整性，重新上传
                self._promptInfo('2', self.$l('L.PS_ILLEGAL_FILE'));
                self.closeQueryParseStatus(timer);
              } else if (resultCode === 18 || resultCode === 22) {
                // 18：解析完成，脚本数据有错误
                // 22：CSV模板数据错误，需要手工确认
                self.closeQueryParseStatus(timer);
                oCallback(data);
              } else if (resultCode === 19 || resultCode === 74) {
                // 19：一致性校验完成，存在冲突数据
                // 74：临时数据表有冲突数据，界面需要手式处理
                self.parseStatus = 'running';
                MarvelTimer.endTimer(timer);
                oCallback(data);
              } else if (resultCode === 20 || resultCode === 51 || resultCode === 76) {
                // 20：校验完成，没有冲突数据
                // 51：正在保存数据
                // 76：数据校验中
                self.parseStatus = 'running';
                self.$refs.refMiniLoading4Parse.setProgress(resultPro, self.$l('L.I_PARSING'));
              } else if (resultCode === 21) {
                // 21：一致性校验完成，相同数据
                self._promptInfo('2', self.$l('L.I_PARSE_ERROR_SAMESCRIPTS'));
                self.closeQueryParseStatus(timer);
                self._getFileList();
              } else if (resultCode === 75 && self.verifyDataConsistencyFlag == false) {
                // 75：进行数据校验
                self.parseStatus = 'running';
                self.verifyDataConsistencyFlag = true;
                const oParam = {
                  userId: window.userId,
                  projectIdStr: window.projectId,
                  fileName: data.fileName,
                  parseType: '100', // 模板解析用"100"
                };
                self._verifyDataConsistencyByPost(oParam, (response) => {
                  // empty function
                });
              } else if (resultPro > 95 || vervity) {
                self.verifyDataConsistencyFlag = false;
                self.$refs.refMiniLoading4Parse.setProgress(100, self.$l('L.I_PARSE_FINISH'));
                self.closeQueryParseStatus(timer);
                oCallback(data);
              } else if (resultCode === 3 || resultPro === '100') {
                // 3：操作成功; 进度100必须在resultCode判断完才能作为判断条件
                if (parseType === 'portAlarm') {
                  self.onloadQuery = false;
                } else {
                  self.verifyDataConsistencyFlag = false;
                }
                self._promptInfo('1', self.$l('L.SDM_FILE_PARSE_SUCCESS'));
                self.closeQueryParseStatus(timer);
                oCallback(data);
              } else {
                self.parseStatus = 'running';
                self.$refs.refMiniLoading4Parse.setProgress(resultPro === '-1' ? '0' : resultPro, self.$l('L.I_PARSING'));
              }
            } else if (parseType !== 'portAlarm' && self.currentParseType == 'script') {
              self.closeQueryParseStatus(timer);
            } else {
              self._promptInfo('2', self.$l('L.SDM_FILE_PARSE_FAIL'));
              self.closeQueryParseStatus(timer);
            }
          });
        }, self.timerIntervel);
      }
    },

    /**
     * 关闭查询解析进度状态
     *
     * @timer 定时器
     */
    closeQueryParseStatus(timer) {
      const self = this;
      self.parseStatus = 'finish'; // 标识解析状态完成
      if (self.$refs.refMiniLoading4Parse) {
        self.$refs.refMiniLoading4Parse.hideEx(); // 隐藏进度条
      }
      if (timer) {
        MarvelTimer.endTimer(timer); // 关闭定时器
      }
    },

    // endregion

    // region pgid error
    onClickDialogClosePgID: function () {
      var self = this;
      this.showDialog4PgID = false;
      this.confirmPgidByPost('confirm');
      this._getProgressByPost(function (oParseRes) {
        self._finishParseCallback(oParseRes);
      });
    },
    onClick4PgIdContinue: function () {
      var self = this;
      this.showDialog4PgID = false;
      this.confirmPgidByPost('confirm');
      this._getProgressByPost(function (oParseRes) {
        self._finishParseCallback(oParseRes);
      });
    },
    onClick4PgIdCancel: function () {
      this.showDialog4PgID = false;
      this.confirmPgidByPost('cancel');
      this.closeQueryParseStatus();
    },
    confirmPgidByPost: function (strType) {
      if (!this.debug) {
        const oParam = {
          statusCode: strType,
          projectId: window.projectId,
          curUserId: window.userId,
        };
        this.httpUtil.postJson(window.restWebRoot + '/WSParseDataService/confirmPgid', oParam, {}).then(
          (response) => {
            // empty function
          },
          (response) => {
            // empty function
          },
        );
      }
    },
    // endregion

    // region file error
    onClick4ScriptErrorContinue: function () {
      var self = this;
      this.showDialog4ScriptError = false;
      this.verifyDataByPost(function () {
        self._getProgressByPost(function (oParseRes) {
          self._finishParseCallback(oParseRes);
        }, 1);
      });
    },
    onClick4ScriptErrorCancel: function () {
      this.showDialog4ScriptError = false;
      this.closeQueryParseStatus();
      this._removeErrorScriptInfo();
    },
    verifyDataByPost: function (oCallback) {
      const oParam = {
        userId: window.userId,
        projectIdStr: window.projectId,
        fileName: this.sdmMess.fileName === undefined ? this.currentParseParam['fileInfo'].fileName : this.sdmMess.fileName,
        parseType: this.sdmMess.parseType === undefined ? this.currentParseParam['fileInfo'].parseType : this.sdmMess.parseType,
      };
      this._verifyDataConsistencyByPost(oParam, function (response) {
        oCallback();
      });
    },
    _removeErrorScriptInfo: function () {
      if (!this.debug) {
        const oParam = {
          projectId: window.projectId,
          curUserId: window.userId,
        };
        this.httpUtil.postJson(window.restWebRoot + '/WSParseDataService/removeErrorScriptInfo', oParam).then(
          (response) => {
            // empty function
          },
          (response) => {
            // empty function
          },
        );
      }
    },
    // endregion

    // region delBoxCode Redis

    delBoxCodeRedis: function (sdmMessVO) {
      if (!this.debug) {
        const oParam = {
          sdmMessVO: {
            userId: sdmMessVO.userId,
            projectIdStr: sdmMessVO.projectIdStr,
          }
        };
        this.httpUtil.postJson(window.restWebRoot + '/WSScriptDataMgrService/delBoxCode', oParam, {}).then(
          (response) => {
            // empty function
          },
          (response) => {
            // empty function
          },
        );
      }
    },

    // endregion

    // region verify data consistency

    _verifyDataConsistencyByPost(oParam, oCallback) {
      if (!this.debug) {
        this.httpUtil.postJson(window.restWebRoot + '/WSDataVerifyService/verifyDataConsistency', { sdmMessVO: oParam }, {}).then(
          (response) => {
            oCallback();
          },
          (response) => {
            // empty function
          }
        );
      }
    },

    // endregion

    // region cancle parse
    onParseCancelClick: function () {
      if (!this.debug) {
        const oParam = {
          projectId: window.projectId,
          curUserId: window.userId,
        };
        this.httpUtil.postJson(window.restWebRoot + '/WSParseDataService/cancelParsePro', oParam).then(
          (response) => {
            // empty function
          },
          (response) => {
            // empty function
          },
        );
      }
    },
    // endregion

    // region finish parse callback
    _finishParseCallback(oParseRes) {
      oParseRes.currentParseType = this.currentParseType;
      oParseRes.curParseVendor = this.curParseVendor;
      oParseRes.currentParseFileName = this.currentParseFileName;

      const resultCode = oParseRes.messCode;
      if (resultCode === 18) {
        // 18：解析完成，脚本数据有错误
        if (this.currentParseType === 'site') {
          oParseRes.templateError = 'true'; // 站点模板跳转解析修正中的模板错误信息
        } else {
          oParseRes.parseSuccess = 'false'; // 资源模板和告警模板跳转解析结果中的错误信息
        }
      } else if (resultCode === 101) {
        // 19：校验完成，存在冲突数据
        oParseRes.parseSuccess = 'false';
      } else if (resultCode === 19) {
        // 19：校验完成，存在冲突数据
        oParseRes.verifyError = 'true';
      } else if (resultCode === 20 || resultCode === 21 || resultCode === 51 || resultCode === 76) {
        // 20：校验完成，没有冲突数据
        // 21：校验完成，是相同数据
        // 51：正在保存数据
        // 76：数据校验中
        return;
      } else if (resultCode === 22) {
        // 22：CSV模板数据错误，需要手工确认
        oParseRes.templateError = 'true';
      } else if (resultCode === 74) {
        // 74：临时数据表有冲突数据，界面需要手式处理
        oParseRes.innerError = 'true';
      } else if (resultCode === 79) {
        // 79：分组业务：非法数据(该脚本文件含有非法数据，请根据错误信息提示检查修改后重新上传解析)
        oParseRes.parseSuccess = 'false';
      } else if (
        resultCode === 3 || // 3：操作成功
        (resultCode === 8 && this.onloadQuery == false)
      ) {
        oParseRes.parseSuccess = 'true';
      } else {
        oParseRes.templateError = 'true';
      }

      this.findParent(this, 'onParseFinish').onParseFinish(oParseRes);
    },
    // endregion

    // region download
    genParam4DownloadFileRecord: function (oRow) {
      return {
        projectId: window.projectId,
        fileInfo: {
          userId: oRow[15].value.userId,
          fileName: oRow[15].value.fileName,
          filePath: oRow[15].value.filePath,
          uploadId: oRow[15].value.uploadId,
        },
      };
    },
    _downloadIconClick: function (oParam, oCallback) {
      var self = this;
      if (this.debug) {
        setTimeout(function () {
          var oParam4GetFile = {
            url: '',
          };
          self.$hideLoading({ key: 'ImportExFileMgrDownLoad' });
          self._getFilePath(oParam4GetFile.url);
        }, 1000);
      } else {
        this.httpUtil.postJson(window.restWebRoot + '/WSScriptDataMgrService/download', oParam, {}).then(
          (response) => {
            window.downloadModule.download_user_defined_file(response, window.projectId, window.productType);
            self.$hideLoading({ key: 'ImportExFileMgrDownLoad' });
          },
          (response) => {
            // empty function
          },
        );
      }
    },
    // endregion

    // region del
    genParam4DelFileRecord: function (oRow) {
      return {
        projectId: window.projectId,
        fileInfo: {
          userId: oRow[15].value.userId,
          fileName: oRow[15].value.fileName,
          fileType: oRow[15].value.fileType,
          uploadId: oRow[15].value.uploadId,
        },
      };
    },

    _deleteIconClick: function (oParam, oCallback) {
      if (this.debug) {
        this.$showPrompt({ status: '1', content: 'delete success scriptDataMgr/deleteUploadData_action' });
        oCallback();
      } else {
        this.httpUtil.postJson(window.restWebRoot + '/WSScriptDataMgrService/deleteUploadData', oParam, {}).then(
          (response) => {
            oCallback();
          },
          (response) => {
            // empty function
          },
        );
      }
    },

    // endregion

    _getFilePath: function (strUrl) {
      if (this.debug) {
        window.open(strUrl, '_blank');
      } else {
        window.location.href = strUrl;
      }
    },

    afterInnerConflictHandle: function () {
      const self = this;
      let parseType = this.findParent(this, 'providerParseRes').providerParseRes().currentParseType;
      if (parseType == 'script') {
        this.verifyDataByPost(function () {
          self.init();
        });
      } else {
        self.init();
      }
    },

    afterSystemConfilct: function () {
      // 默认进来时，需要查询当前的解析进度，用于恢复
      this.currentParseFileName = '';
      this.onloadQuery = true; // 保留以前的处理（具体原因需要结合后台考虑）
      this.parseRecovery();
    },

    // region pre parse dialog
    onClickDialogClose4PreParse: function () {
      this.showDialog4PreParse = false;
    },

    onClickDialogPreParse4LookGuide: function () {
      this.showDialog4PreParse = false;
      this.onClick4DownloadGuide();
    },

    onClickDialogPreParse4Confirm: function () {
      this.showDialog4PreParse = false;
    },

    showFileErrDialog: function (errCode) {
      this.showDialog4PreParse = true;
      const errCodeArr = errCode.split('-');
      const notMatch = "<span style='color: red'>" + this.$l('L.HW_SCRIPT_PRE_PARSE_NOT_MATCH') + '</span>';
      const match = "<span style='color: green'>" + 'OK' + '</span>';
      this.html4UploadFormat = '';
      this.html4WholeNet = '';
      this.html4OneNe = '';
      if (errCodeArr[0] == 0) {
        this.html4UploadFormat = this.$l('L.HW_SCRIPT_PRE_PARSE_UPLOAD_FORMAT') + notMatch;
      } else {
        this.html4UploadFormat = this.$l('L.HW_SCRIPT_PRE_PARSE_UPLOAD_FORMAT') + match;
      }

      if (errCodeArr[1] == 0) {
        this.html4WholeNet = this.$l('L.HW_SCRIPT_PRE_PARSE_TOTAL_CONFIG') + notMatch;
      } else {
        this.html4WholeNet = this.$l('L.HW_SCRIPT_PRE_PARSE_TOTAL_CONFIG') + match;
      }

      if (errCodeArr[2] == 0) {
        this.html4OneNe = this.$l('L.HW_SCRIPT_PRE_PARSE_ONE_NE_CONFIG') + notMatch;
      } else {
        this.html4OneNe = this.$l('L.HW_SCRIPT_PRE_PARSE_ONE_NE_CONFIG') + match;
      }
    },
    // endregion pre parse dialog
    _promptInfo(strStatus, strContent) {
      this.$showPrompt({
        status: strStatus,
        content: strContent,
      });
    },

    startPreParse(oParam) {
      const self = this;
      if (this.debug) {
        return;
      }

      // 设置默认勾选解析SDH路径
      this.parseStatus = 'preParse_running';
      this.$refs.ref4CheckBoxParseTrail.setStatus(true, false);
      this.isParseTrail = this.$refs.ref4CheckBoxParseTrail.getCheckItem();

      const queryPreParseProgress = () => {
        self.queryParseProgressByPost(function (data) {
          const resultCode = data.messCode;

          if (resultCode == 3) {
            // 3：操作成功
            self.HWNeNum = parseInt(data.result);
            if (self.HWNeNum !== undefined) {
              self.calcParseTime();
            }
          } else if (resultCode == 4 || resultCode == 8) {
            // 4：操作失败
            // 8：通讯失败
            self._promptInfo('2', data.messStr);
            self.closeQueryParseStatus();
          } else if (resultCode == 13) {
            // 13：文件数据不完整，请检查文件完整性，重新上传
            const reg = new RegExp('^([0-1]-[0-1]-[0-1])$');
            if (reg.test(data.result)) {
              self.showFileErrDialog(data.result);
            } else {
              self._promptInfo('2', data.messStr);
            }
            self.closeQueryParseStatus();
          } else {
            setTimeout(function () {
              queryPreParseProgress();
            }, 3000);
          }
        });
      };

      this.startParseByPost(oParam, function (result) {
        if (result) {
          setTimeout(function () {
            queryPreParseProgress();
          }, 1000);
        } else {
          self.closeQueryParseStatus();
        }
      });
    },

    // 计算解析所需时间
    calcParseTime() {
      let dwBasicTime; // 数仓解析基础时间
      let neCoefficient; // ne系数
      let trailCoefficient; // trail系数

      if (this.HWNeNum < 1500) {
        // 小规模 0-1500
        dwBasicTime = 3;
        neCoefficient = 0.002;
        trailCoefficient = 0.001;
      } else if (this.HWNeNum < 7500) {
        // 中规模 1500-7500
        dwBasicTime = 5;
        neCoefficient = 0.001;
        trailCoefficient = 0.001;
      } else if (this.HWNeNum < 12000) {
        // 大规模 7500-12000
        dwBasicTime = 5;
        neCoefficient = 0.002;
        trailCoefficient = 0.002;
      } else {
        // 极限规模 >=12000
        dwBasicTime = 5;
        neCoefficient = 0.002;
        trailCoefficient = 0.003;
      }

      if (this.curParseVendor == 200) {
        // 数仓解析
        this.HWNeTime = (this.HWNeNum * neCoefficient + dwBasicTime).toFixed(2);
        this.HWTrailTime = ((this.HWNeNum * trailCoefficient) / 2).toFixed(2);
      } else {
        // 华为解析
        this.HWNeTime = (this.HWNeNum * neCoefficient).toFixed(2);
        this.HWTrailTime = (this.HWNeNum * trailCoefficient).toFixed(2);
      }

      this.selectParseTrail();
      this.$refs.ref4CheckBoxParseTrail.setStatus(this.$refs.ref4CheckBoxParseTrail.getCheckItem(), false);
      this.showDialog4ParseTrail = true;
    },

    selectParseTrail() {
      if (this.$refs.ref4CheckBoxParseTrail.getCheckItem()) {
        this.dialogCont4ParseTrail = MarvelStr.format(
          this.$l('L.TEXT_PARSEDATA_PROMPT'),
          this.HWNeNum,
          (parseFloat(this.HWNeTime) + parseFloat(this.HWTrailTime)).toFixed(2),
        );
      } else {
        this.dialogCont4ParseTrail = MarvelStr.format(this.$l('L.TEXT_PARSEDATA_PROMPT'), this.HWNeNum, parseFloat(this.HWNeTime));
      }
    },

    // 华为脚本预解析（SDH路径）弹框，确认解析
    onClick4ParseTrailOk() {
      this.closeQueryParseStatus();
      this.showDialog4ParseTrail = false;
      this.isParseTrail = this.$refs.ref4CheckBoxParseTrail.getCheckItem();
      this._startParse(this.currentSelectRow);
    },

    // 华为脚本预解析（SDH路径）弹框，取消/关闭
    onClick4ParseTrailCancel() {
      this.showDialog4ParseTrail = false;
      this.isParseTrail = undefined;
      this.closeQueryParseStatus();
    },

    initUpload() {
      window.UploadingProgress = (progress, clientId) => {
        if (clientId == 'sdm') {
          this.$refs.ref4UploadButton.setBtnDisable(true);
          this.$refs.refMiniLoading.setProgress(progress[this.fileName].progress, this.$l('L.I_UPLOADING'));
        }
      };
      window.UploadingFail = (failInfo, clientId) => {
        if (clientId == 'sdm') {
          this.$refs.refMiniLoading.hideEx();
          this.$showPrompt({
            status: '2',
            content: this.$l('L.I_UPLOAD_FAIL') + SensitiveCheckUtils.getUploadCheckMsgByFileName(failInfo, this.fileName),
          });
        }
        this.$refs.ref4UploadButton.setBtnDisable(false);
      };
      window.UploadingSuccess = (successInfo, clientId) => {
        this.$refs.refMiniLoading.setProgress(Number('100'), this.$l('L.I_UPLOAD_SUCCESS'));
        this.afterUploadToFsOK(successInfo, clientId);
      };
      window.FilesSelected = (files, clientId) => {
        this.onSelectFileBtnClick();
      };
    },
  },
};
</script>
      `;
    const transformedCode = transform(code);
    expect(transformedCode).toMatchInlineSnapshot(``);
  });

});
