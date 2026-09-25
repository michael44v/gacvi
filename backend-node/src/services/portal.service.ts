import { PortalRepository } from '../repositories/portal.repository';

export class PortalService {
  private portalRepo: PortalRepository;

  constructor() {
    this.portalRepo = new PortalRepository();
  }

  public async getTeacherOfferings(userId: number, userRoles: string[]) {
    return await this.portalRepo.getTeacherOfferings(userId, userRoles);
  }

  public async getOfferingStudents(offeringId: number) {
    if (!offeringId) {
      throw { statusCode: 400, message: 'Offering ID is required' };
    }
    return await this.portalRepo.getOfferingStudents(offeringId);
  }

  public async recordAttendance(
    userId: number,
    offeringId: number,
    classDate: string,
    records: Array<{ student_id: number; status: string; remarks?: string }>
  ) {
    if (!offeringId || !classDate || !records || records.length === 0) {
      throw {
        statusCode: 400,
        message: 'Offering ID, class date, and student attendance records required',
      };
    }

    await this.portalRepo.recordAttendance({
      offering_id: offeringId,
      class_date: classDate,
      recorded_by: userId,
      records,
    });

    return null;
  }

  public async getParentWards(parentId: number) {
    return await this.portalRepo.getParentWards(parentId);
  }

  public async getWardOverview(studentId: number) {
    if (!studentId) {
      throw { statusCode: 400, message: 'Student ID is required' };
    }
    return await this.portalRepo.getWardOverview(studentId);
  }

  public async getAdminStats() {
    return await this.portalRepo.getAdminStats();
  }
}
