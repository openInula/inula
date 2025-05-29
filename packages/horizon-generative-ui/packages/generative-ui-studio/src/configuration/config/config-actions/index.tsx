'use client'
import type { FC } from 'react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'ahooks'
import produce from 'immer'
import Panel from '../base/feature-panel'
import Tooltip from '@/components/base/tooltip'
import { getNewDSLAction } from '@/utils/var'
import { useEventEmitterContextContext } from '@/context/event-emitter'
import type { DSLActionType, PromptDSLAction } from '@/models/debug'
import SelectActionsType from './select-actions-type'
import EditModal from './config-modal'
import VarItem from './var-item'

export const ADD_EXTERNAL_DATA_TOOL = 'ADD_EXTERNAL_DATA_TOOL'

type ExternalDataToolParams = {
  key: string
  type: string
  index: number
  name: string
  config?: Record<string, any>
  icon?: string
  icon_background?: string
  action: PromptDSLAction
}

export type IConfigActionsProps = {
  promptActions: PromptDSLAction[]
  readonly?: boolean
  onPromptDSLActionsChange?: (promptActions: PromptDSLAction[]) => void
}

const ConfigActions: FC<IConfigActionsProps> = ({ promptActions, readonly, onPromptDSLActionsChange }) => {
  const { t } = useTranslation()
  const { eventEmitter } = useEventEmitterContextContext()

  const [isShowEditModal, { setTrue: showEditModal, setFalse: hideEditModal }] = useBoolean(false)

  const handleAddAction = (type: DSLActionType) => {
    const newAction = getNewDSLAction('', type)
    const newPromptDSLActions = [...promptActions, newAction]
    onPromptDSLActionsChange?.(newPromptDSLActions)

    // if (type === 'api') {
    //   handleOpenExternalDataToolModal({
    //     type,
    //     key: newVar.key,
    //     name: newVar.name,
    //     index: promptActions.length,
    //   }, newPromptDSLActions)
    // }
  }

  const [currIndex, setCurrIndex] = useState<number>(-1)
  const currItem = currIndex !== -1 ? promptActions[currIndex] : null

  const currItemToEdit: PromptDSLAction | null = (() => {
    if (!currItem)
      return null

    return {
      ...currItem,
    } as PromptDSLAction
  })()

  const updatePromptDSLActionItem = (payload: PromptDSLAction) => {
    const newPromptDSLActions = produce(promptActions, (draft) => {
      draft[currIndex] = payload
    })
    onPromptDSLActionsChange?.(newPromptDSLActions)
  }

  eventEmitter?.useSubscription((v: any) => {
    if (v.type === ADD_EXTERNAL_DATA_TOOL) {
      const payload = v.payload
      onPromptDSLActionsChange?.([
        ...promptActions,
        {
          key: payload.variable as string,
          name: payload.key as string,
          enabled: payload.enabled,
          type: payload.type as string,
          config: payload.config,
          required: true,
          icon: payload.icon,
          icon_background: payload.icon_background,
        },
      ])
    }
  })

  const hasActions = promptActions.length > 0

  const didRemoveVar = (index: number) => {
    onPromptDSLActionsChange?.(promptActions.filter((_, i) => i !== index))
  }

  const handleRemoveVar = (index: number) => {
    const removeVar = promptActions[index]

    didRemoveVar(index)
  }


  const handleConfig = ({ key, type, index, action }: ExternalDataToolParams) => {
    setCurrIndex(index)
    showEditModal()
  }

  return (
    <Panel
      className="mt-2"
      title={
        <div className='flex items-center'>
          <div className='mr-1'>交互</div>
          {!readonly && (
            <Tooltip
              popupContent={
                <div className='w-[180px]'>
                  {t('appDebug.variableTip')}
                </div>
              }
            />
          )}
        </div>
      }
      headerRight={<SelectActionsType onChange={handleAddAction} />}
      noBodySpacing
    >
      {!hasActions && (
        <div className='mt-1 px-3 pb-3'>
          <div className='pb-1 pt-2 text-xs text-text-tertiary'>动作可以定义生成式UI中可用到actions</div>
        </div>
      )}
      {hasActions && (
        <div className='mt-1 px-3 pb-3'>
          {promptActions.map((action, index) => {
            const { key, type } = action
            return (
              <VarItem
                key={index}
                readonly={readonly}
                type={type}
                action={action}
                onEdit={() => handleConfig({ type, key, index, action })}
                onRemove={() => handleRemoveVar(index)}
              />
            )
          })}
        </div>
      )}

      {isShowEditModal && (
        <EditModal
          payload={currItemToEdit!}
          isShow={isShowEditModal}
          onClose={hideEditModal}
          onConfirm={(item) => {
            updatePromptDSLActionItem(item)
            hideEditModal()
          }}
          varKeys={promptActions.map(v => v.key)}
        />
      )}
    </Panel>
  )
}
export default React.memo(ConfigActions)
