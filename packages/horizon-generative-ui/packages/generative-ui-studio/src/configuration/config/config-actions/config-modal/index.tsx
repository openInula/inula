'use client'
import type { FC } from 'react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useContext } from 'use-context-selector'
import produce from 'immer'
import ModalFoot from '../modal-foot'
import SelectTypeItem from '../select-type-item'
import Field from './field'
import Input from '@/components/base/input'
import Toast from '@/components/base/toast'
import { getNewDSLAction } from '@/utils/var'
import ConfigContext from '@/context/debug-configuration'
import Modal from '@/components/base/modal'
import {  DSLActionType,  } from '@/models/debug'
import { PromptDSLAction } from '@/models/debug'


export type IConfigModalProps = {
  isCreate?: boolean
  payload?: PromptDSLAction
  isShow: boolean
  varKeys?: string[]
  onClose: () => void
  onConfirm: (newValue: InputVar, moreInfo?: MoreInfo) => void
  supportFile?: boolean
}

const ConfigModal: FC<IConfigModalProps> = ({
  isCreate,
  payload,
  isShow,
  onClose,
  onConfirm,
}) => {
  const { promptConfig: modelConfig } = useContext(ConfigContext)
  const { t } = useTranslation()
  const [tempPayload, setTempPayload] = useState<PromptDSLAction>(payload || getNewDSLAction('', DSLActionType.event) as any)
  const { type, key, } = tempPayload
  const modalRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // To fix the first input element auto focus, then directly close modal will raise error
    if (isShow)
      modalRef.current?.focus()
  }, [isShow])

  const checkVariableName = useCallback((value: string, canBeEmpty?: boolean) => {
    return true
  }, [t])
  const handlePayloadChange = useCallback((key: string) => {
    return (value: any) => {
      setTempPayload((prev) => {
        const newPayload = {
          ...prev,
          [key]: value,
        }

        return newPayload
      })
    }
  }, [])

  const handleTypeChange = useCallback((type: DSLActionType) => {
    return () => {
      const newPayload = produce(tempPayload, (draft) => {
        draft.type = type
        // if ([DSLActionType.singleFile, DSLActionType.multiFiles].includes(type)) {
        //   (Object.keys(DEFAULT_FILE_UPLOAD_SETTING)).forEach((key) => {
        //     if (key !== 'max_length')
        //       (draft as any)[key] = (DEFAULT_FILE_UPLOAD_SETTING as any)[key]
        //   })
        //   if (type === DSLActionType.multiFiles)
        //     draft.max_length = DEFAULT_FILE_UPLOAD_SETTING.max_length
        // }
        // if (type === DSLActionType.paragraph)
        //   draft.max_length = DEFAULT_VALUE_MAX_LEN
      })
      setTempPayload(newPayload)
    }
  }, [tempPayload])

  const handleVarKeyBlur = useCallback((e: any) => {
    const varName = e.target.value
    if (!checkVariableName(varName, true) || tempPayload.key)
      return

    setTempPayload((prev) => {
      return {
        ...prev,
        key: varName,
      }
    })
  }, [checkVariableName, tempPayload.key])

  const handleConfirm = () => {
    onConfirm(tempPayload)
  }

  return (
    <Modal
      title={isCreate ? '新增动作' : '编辑动作'}
      isShow={isShow}
      onClose={onClose}
    >
      <div className='mb-8' ref={modalRef} tabIndex={-1}>
        <div className='space-y-2'>

          <Field title="动作类型">
            <div className='grid grid-cols-3 gap-2'>
              <SelectTypeItem type={"事件"} selected={type === DSLActionType.event} onClick={handleTypeChange(DSLActionType.event)} />
              <SelectTypeItem type={"链接"} selected={type === DSLActionType.link} onClick={handleTypeChange(DSLActionType.link)} />
              <SelectTypeItem type={"跳转"} selected={type === DSLActionType.function} onClick={handleTypeChange(DSLActionType.function)} />
            </div>
          </Field>

          <Field title=" 标签名">
            <Input
              value={key as string}
              onChange={e => handlePayloadChange('key')(e.target.value)}
              placeholder="请输入"
            />
          </Field>

          {type === DSLActionType.link && (
            <>
              <Field title='链接地址'>
                <Input
                  value={tempPayload.target}
                  onChange={e => handlePayloadChange('target')(e.target.value)}
                  placeholder="请输入"
                />
              </Field>
              <Field title='描述'>
                <Input
                  value={tempPayload.description}
                  onChange={e => handlePayloadChange('description')(e.target.value)}
                  placeholder="请输入"
                />
              </Field>
            </>
          )}


          {/* {type === DSLActionType.select && (
            <Field title={t('appDebug.variableConfig.options')}>
              <ConfigSelect options={options || []} onChange={handlePayloadChange('options')} />
            </Field>
          )}

          {[DSLActionType.singleFile, DSLActionType.multiFiles].includes(type) && (
            <FileUploadSetting
              payload={tempPayload as UploadFileSetting}
              onChange={(p: UploadFileSetting) => setTempPayload(p as InputVar)}
              isMultiple={type === DSLActionType.multiFiles}
            />
          )} */}

        </div>
      </div>
      <ModalFoot
        onConfirm={handleConfirm}
        onCancel={onClose}
      />
    </Modal>
  )
}
export default React.memo(ConfigModal)
