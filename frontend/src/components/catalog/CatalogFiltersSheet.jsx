import { useTranslation } from 'react-i18next'
import { Button, Chips } from '../design-system'
import { Sheet } from '../ui/BottomSheet'

/** Filtros secundarios del catálogo: material y nivel, con cuántos ejercicios hay en cada uno. */
export function CatalogFiltersSheet({ open, equipment, levels, value, onChange, onClose, resultCount }) {
  const { t } = useTranslation()
  return (
    <Sheet
      isOpen={open}
      onClose={onClose}
      title={t('catalogPage.filters')}
      footer={
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <Button variant="quiet" onClick={() => onChange({ equipment: [], level: 'all' })}>
            {t('catalogPage.clear')}
          </Button>
          <Button size="lg" onClick={onClose}>
            {t('catalogPage.show', { count: resultCount })}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 pb-2">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gym-text-dim">{t('catalogPage.equipment')}</p>
          <Chips
            multiple
            label={t('catalogPage.equipment')}
            value={value.equipment}
            onChange={(next) => onChange({ ...value, equipment: next })}
            options={equipment}
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gym-text-dim">{t('exerciseDetail.level')}</p>
          <Chips
            label={t('exerciseDetail.level')}
            value={value.level}
            onChange={(level) => onChange({ ...value, level })}
            options={[{ value: 'all', label: t('catalogPage.anyLevel') }, ...levels]}
          />
        </div>
      </div>
    </Sheet>
  )
}
