import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, Megaphone, Award, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

const GroupSelection = ({ groups, onSelect }) => {
  const { isRTL } = useLanguage();
  const t = useTranslation();

  // Icon mapping for common group types
  const getGroupIcon = (groupName) => {
    const name = groupName.toLowerCase();
    if (name.includes('attendee') || name.includes('حضور')) return Users;
    if (name.includes('speaker') || name.includes('متحدث')) return Megaphone;
    if (name.includes('sponsor') || name.includes('راعي')) return Award;
    if (name.includes('vip') || name.includes('مهم')) return UserCheck;
    return Users;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {t.selectRole}
        </CardTitle>
        <CardDescription>
          {t.chooseAppropriateCategory}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => {
            const Icon = getGroupIcon(group.name);
            const remaining = group.capacity; // This should be calculated from backend
            
            return (
              <Card
                key={group.name}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-primary"
                onClick={() => onSelect(group)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{group.name}</h3>
                        <p className="text-sm text-gray-600">
                          {t.capacity}: <span className="font-medium">{group.capacity}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {group.fields.length} {t.fieldsRequired}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-gray-400 ${isRTL ? 'rotate-180' : ''}`} />
                  </div>
                  
                  <Button className="w-full mt-4" variant="outline">
                    {t.selectThisCategory}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {t.noCategoriesAvailable}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GroupSelection;