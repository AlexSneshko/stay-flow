import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState({
    currency: 'USD',
    theme: 'system',
    weekStartsOn: 1,
    roundToNearestDollar: false,
  })
})

describe('useSettingsStore', () => {
  it('defaults currency to "USD"', () => {
    expect(useSettingsStore.getState().currency).toBe('USD')
  })

  it('setCurrency updates the currency correctly', () => {
    useSettingsStore.getState().setCurrency('EUR')
    expect(useSettingsStore.getState().currency).toBe('EUR')
  })

  it('defaults theme to "system"', () => {
    expect(useSettingsStore.getState().theme).toBe('system')
  })

  it('setTheme updates the theme to "dark"', () => {
    useSettingsStore.getState().setTheme('dark')
    expect(useSettingsStore.getState().theme).toBe('dark')
  })

  it('setTheme updates the theme to "light"', () => {
    useSettingsStore.getState().setTheme('light')
    expect(useSettingsStore.getState().theme).toBe('light')
  })

  it('weekStartsOn defaults to 1 (Monday)', () => {
    expect(useSettingsStore.getState().weekStartsOn).toBe(1)
  })

  it('setWeekStartsOn updates to 0 (Sunday)', () => {
    useSettingsStore.getState().setWeekStartsOn(0)
    expect(useSettingsStore.getState().weekStartsOn).toBe(0)
  })

  it('defaults roundToNearestDollar to false', () => {
    expect(useSettingsStore.getState().roundToNearestDollar).toBe(false)
  })

  it('setRoundToNearestDollar toggles to true', () => {
    useSettingsStore.getState().setRoundToNearestDollar(true)
    expect(useSettingsStore.getState().roundToNearestDollar).toBe(true)
  })

  it('setRoundToNearestDollar can toggle back to false', () => {
    useSettingsStore.getState().setRoundToNearestDollar(true)
    useSettingsStore.getState().setRoundToNearestDollar(false)
    expect(useSettingsStore.getState().roundToNearestDollar).toBe(false)
  })

  it('language defaults to "en"', () => {
    expect(useSettingsStore.getState().language).toBe('en')
  })

  it('accentColor defaults to "#2d4dff"', () => {
    expect(useSettingsStore.getState().accentColor).toBe('#2d4dff')
  })
})
