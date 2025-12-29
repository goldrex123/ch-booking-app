'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleForm } from '@/components/vehicle/VehicleForm';

import { vehicleApi } from '@/lib/api/vehicles';
import { useVehicleStore } from '@/store/vehicleStore';
import type { VehicleFormValues } from '@/lib/validations/vehicle';

/**
 * 차량 생성 페이지
 */
export default function NewVehiclePage() {
  const router = useRouter();
  const { addVehicle } = useVehicleStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: VehicleFormValues) => {
    setIsLoading(true);

    try {
      const result = await vehicleApi.create(data);

      if (result.success && result.data) {
        addVehicle(result.data);
        toast.success('차량이 등록되었습니다');
        router.push('/dashboard/vehicles');
      } else {
        toast.error(result.error || '차량 등록에 실패했습니다');
      }
    } catch (error) {
      console.error('차량 등록 오류:', error);
      toast.error('차량 등록 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/vehicles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">차량 등록</h1>
          <p className="text-muted-foreground">
            새로운 차량을 등록합니다
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>차량 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleForm mode="create" onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
