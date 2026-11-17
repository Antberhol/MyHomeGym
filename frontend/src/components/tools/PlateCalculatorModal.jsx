import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { calculatePlateDistribution } from '../../utils/plateCalculator'
import { formatNumber } from '../../utils/format'
import { LoadedBarbell } from '../brand/LoadedBarbell'
import { Chips } from '../design-system'
import { Sheet } from '../ui/BottomSheet'
import { NumberStepper } from '../ui/NumberStepper'

const BARS = [20, 15, 10]

/** Qué discos poner en cada lado para llegar a un peso, dibujado como la barra real. */
export function PlateCalculatorModal({ isOpen, onClose, initialTargetWeight = 100 }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [targetWeight, setTargetWeight] = useState(initialTargetWeight)
  const [barWeight, setBarWeight] = useState(20)
  const result = useMemo(() => calculatePlateDistribution(targetWeight, barWeight), [barWeight, targetWeight])
  const perSide = result.perSide.length
    ? result.perSide.map((p) => formatNumber(p, lang, 2)).join(' + ')
    : t('plateCalculator.noPlates')

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={t('plateCalculator.title')}>
      <div className="space-y-5 pb-2">
        <NumberStepper
          label={t('plateCalculator.targetWeight')}
          value={targetWeight}
          onChange={setTargetWeight}
          step={2.5}
          min={0}
          decimals={2}
          unit="kg"
        />
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-gym-text-dim">{t('plateCalculator.barWeight')}</p>
          <Chips
            label={t('plateCalculator.barWeight')}
            value={barWeight}
            onChange={setBarWeight}
            options={BARS.map((value) => ({ value, label: `${value} kg` }))}
          />
        </div>
        <div className="rounded-2xl bg-gym-black px-3 pb-4 pt-2">
          <LoadedBarbell
            weight={result.totalLoaded}
            barWeight={barWeight}
            label={t('plateCalculator.perSide', { value: perSide })}
          />
          <p className="mt-1 text-center text-sm text-gym-text-muted">{t('plateCalculator.eachSide')}</p>
          <p className="tabular text-center font-display text-3xl font-extrabold text-gym-text-bright">
            {perSide}
          </p>
        </div>
        {!result.isExact && (
          <p className="text-[15px] text-gym-text-dim">
            {t('plateCalculator.closest', { total: formatNumber(result.totalLoaded, lang, 2) })}
          </p>
        )}
      </div>
    </Sheet>
  )
}
