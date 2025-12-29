'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

import { useVehicleStore } from '@/store/vehicleStore';
import { vehicleApi } from '@/lib/api/vehicles';
import type { Vehicle } from '@/types';
import { VEHICLE_TYPE_LABELS, VEHICLE_STATUS_LABELS } from '@/lib/constants';

/**
 * 차량 목록 페이지
 */
export default function VehiclesPage() {
  const { vehicles, setVehicles, deleteVehicle } = useVehicleStore();
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      const result = await vehicleApi.getAll();
      if (result.success && result.data) {
        setVehicles(result.data);
      }
    } catch (error) {
      console.error('차량 목록 로드 오류:', error);
      toast.error('차량 목록을 불러오는 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const result = await vehicleApi.delete(deleteTarget.id);
      if (result.success) {
        deleteVehicle(deleteTarget.id);
        toast.success('차량이 삭제되었습니다');
      } else {
        toast.error(result.error || '차량 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('차량 삭제 오류:', error);
      toast.error('차량 삭제 중 오류가 발생했습니다');
    } finally {
      setDeleteTarget(null);
    }
  };

  const getStatusVariant = (status: Vehicle['status']) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'in-use':
        return 'secondary';
      case 'maintenance':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">차량 관리</h1>
          <p className="text-muted-foreground">
            등록된 차량을 관리합니다
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/vehicles/new">
            <Plus className="mr-2 h-4 w-4" />
            차량 등록
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>차량 목록</CardTitle>
          <CardDescription>
            총 {vehicles.length}대의 차량이 등록되어 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              등록된 차량이 없습니다
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>차량명</TableHead>
                    <TableHead>차량번호</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>탑승인원</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.name}</TableCell>
                      <TableCell>{vehicle.licensePlate}</TableCell>
                      <TableCell>{VEHICLE_TYPE_LABELS[vehicle.type]}</TableCell>
                      <TableCell>{vehicle.capacity}명</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(vehicle.status)}>
                          {VEHICLE_STATUS_LABELS[vehicle.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                          >
                            <Link href={`/dashboard/vehicles/${vehicle.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(vehicle)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="차량 삭제"
        description={`정말로 "${deleteTarget?.name}" 차량을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        onConfirm={handleDelete}
        confirmText="삭제"
        cancelText="취소"
      />
    </div>
  );
}
