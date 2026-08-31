import { BusinessRepository } from "../../repositories/BusinessRepository";

export class BusinessService {
  private repository = new BusinessRepository();

  async getBusinesses() {
    return await this.repository.findAll();
  }

  async getBusiness(id: string) {
    return await this.repository.findById(id);
  }

  async createBusiness(data: unknown) {
    return await this.repository.create(data);
  }
}