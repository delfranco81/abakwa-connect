import { BusinessService } from "../../services/business/BusinessService";

const service = new BusinessService();

export const business = {
  list() {
    return service.getBusinesses();
  },

  get(id: string) {
    return service.getBusiness(id);
  },

  create(data: unknown) {
    return service.createBusiness(data);
  },
};