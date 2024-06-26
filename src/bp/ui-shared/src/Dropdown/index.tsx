import { Button, Classes, MenuItem } from '@blueprintjs/core'
import { ItemPredicate, Select } from '@blueprintjs/select'
import cx from 'classnames'
import { FC, useEffect, useState } from 'react'
import React from 'react'

import { lang } from '../translations'
import confirmDialog from '../ConfirmDialog'

import style from './style.scss'
import { DropdownProps, Option } from './typings'

const itemRenderer = (option, { modifiers, handleClick }) => {
  if (!modifiers.matchesPredicate) {
    return null
  }

  return (
    <MenuItem
      className={Classes.SMALL}
      active={modifiers.active}
      disabled={modifiers.disabled}
      key={option.label || option}
      onClick={handleClick}
      text={option.label || option}
    />
  )
}

const filterOptions: ItemPredicate<Option> = (query, option) => {
  return `${option.label.toLowerCase()} ${option.value}`.indexOf(query.toLowerCase()) > -1
}

const Dropdown: FC<DropdownProps> = props => {
  const {
    placeholder,
    filterPlaceholder,
    confirmChange,
    defaultItem,
    items,
    onChange,
    small,
    icon,
    rightIcon,
    children,
    spaced,
    className,
    filterable,
    filterList,
    customItemRenderer
  } = props
  const [activeItem, setActiveItem] = useState<Option | undefined>()
  const SimpleDropdown = Select.ofType<Option>()

  useEffect(() => {
    setActiveItem(typeof defaultItem === 'string' ? items.find(item => item.value === defaultItem) : defaultItem)
  }, [defaultItem])

  const updateSelectedOption = option => {
    onChange(option)
  }

  const btnText = activeItem ? activeItem.label : placeholder

  return (
    <SimpleDropdown
      filterable={filterable}
      className={className}
      inputProps={{ placeholder: filterPlaceholder || lang('filter') }}
      items={items}
      activeItem={activeItem}
      popoverProps={{ minimal: true, usePortal: false }}
      itemRenderer={customItemRenderer || itemRenderer}
      itemPredicate={filterOptions}
      itemListPredicate={filterList}
      onItemSelect={async option => {
        if (confirmChange) {
          confirmChange.callback?.(false)

          if (
            await confirmDialog(confirmChange.message, {
              acceptLabel: confirmChange.acceptLabel
            })
          ) {
            confirmChange.callback?.(true)
            updateSelectedOption(option)
          } else {
            confirmChange.callback?.(true)
          }
        } else {
          updateSelectedOption(option)
        }
      }}
    >
      {children || (
        <Button
          className={cx(style.btn, { [style.spaced]: spaced, [style.placeholder]: !activeItem })}
          text={small ? <small>{btnText}</small> : btnText}
          icon={icon}
          rightIcon={rightIcon || 'double-caret-vertical'}
          small={small}
        />
      )}
    </SimpleDropdown>
  )
}

export default Dropdown
