import { UserRepository } from "../repositories/user.repository";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll() {
    return this.userRepository.findAllSafe();
  }
}
