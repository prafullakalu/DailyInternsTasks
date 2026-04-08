import { userRepository } from '../repositories/userRepository';

export const userService = {
  findByEmail(email: string) {
    return userRepository.findByEmail(email);
  },
  findById(id: string) {
    return userRepository.findById(id);
  },
  create(data: { name: string; email: string; password: string }) {
    return userRepository.create(data);
  },
  update(id: string, data: Partial<{ name: string; email: string }>) {
    return userRepository.update(id, data);
  },
};
