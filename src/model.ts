import { ObserverComponent } from '@/observer_component';
import { Course, User } from 'ag-client-typescript';

export class Model {
    private static _instance: Model | null = null;
    static get_instance(): Model {
        if (Model._instance === null) {
            Model._instance = new Model();
        }
        return Model._instance;
    }

    private _subscribers: Set<ObserverComponent> = new Set();
    subscribe(observer: ObserverComponent) {
        this._subscribers.add(observer);
    }

    unsubscribe(observer: ObserverComponent) {
        this._subscribers.delete(observer);
    }

    // use function from course.ts
    // mock this method instead
    async get_courses_for_user(user: User): Promise<AllCourses> {
        return Course.get_courses_for_user(user);
    }

    async get_users_for_course(course: Course): Promise<AllUsersInCourse> {
        let [course_admins,
             course_staff,
             course_students,
             course_handgraders] = await Promise.all([
                 course.get_admins(),
                 course.get_staff(),
                 course.get_students(),
                 course.get_handgraders()
        ]);
        return {
            course_admins: course_admins,
            course_staff: course_staff,
            course_students: course_students,
            course_handgraders: course_handgraders
        };
    }
}

export interface AllCourses {
    courses_is_admin_for: Course[];
    courses_is_staff_for: Course[];
    courses_is_student_in: Course[];
    courses_is_handgrader_for: Course[];
}

export interface AllUsersInCourse {
    course_admins: User[];
    course_staff: User[];
    course_students: User[];
    course_handgraders: User[];
}
