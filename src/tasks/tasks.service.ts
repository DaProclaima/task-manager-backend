import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    return this.taskRepository.getTasks(filterDto, user);
  }

  async getTaskById(id: number, user: User): Promise<Task> {
    const found = await this.taskRepository.findOne({
      where: { id, userId: user.id },
    });

    if (!found) {
      //  Nest provides the error handler,
      //  we return an error not handled by controller,
      //  but to nest behind the scene (as an http error excep)
      /*
        {
          "statusCode": 404,
          "message": "Task with id not found"
        }
      */
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return found;
  }

  // getTasksWithFilters(filterDto: GetTasksFilterDto): Task[] {
  //   const { status, search } = filterDto;
  //   let tasks = this.getAllTasks();
  //   if (status) {
  //     tasks = tasks.filter((task) => task.status === status);
  //   }
  //   if (search) {
  //     tasks = tasks.filter(
  //       (task) =>
  //         task.title.includes(search) || task.description.includes(search),
  //     );
  //   }
  //   return tasks;
  // }
  //
  async createTask(createTaskDto: CreateTaskDto, user: User) {
    return this.taskRepository.createTask(createTaskDto, user);
  }

  // async deleteTask(id: number): Promise<Task> {
  //   const found = await this.getTaskById(id);
  //   if (found) {
  //     return await this.taskRepository.remove(found);
  //     // return await this.taskRepository.save(found);
  //     // return found;
  //   }
  // }
  async deleteTask(id: number, user: User): Promise<void> {
    const result = await this.taskRepository.delete({ id, userId: user.id });
    if (result.affected === 0) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
  }

  async updateTaskStatus(
    id: number,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    await task.save();
    return task;
  }
}
