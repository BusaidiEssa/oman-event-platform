import { Button } from '@/components/ui/button';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

const RoleSelection = ({ groups, onSelect }) => {
  const { isRTL } = useLanguage();
  const t = useTranslation();

  return (
    <div>
      <h3 className={`text-lg font-semibold mb-4 text-center ${isRTL ? 'font-arabic' : ''}`}>
        {t.selectRole}
      </h3>
      <div className="grid gap-3">
        {groups.map((group) => (
          <Button
            key={group._id}
            variant="outline"
            className="h-auto p-4 flex justify-between items-center hover:bg-teal-50"
            onClick={() => onSelect(group)}
          >
            <span className={`text-lg ${isRTL ? 'font-arabic' : ''}`}>{group.name}</span>
            <span className="text-sm text-gray-500">Capacity: {group.capacity}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelection;
