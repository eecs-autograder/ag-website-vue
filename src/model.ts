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

    async get_courses_for_user(user: User): Promise<AllCourses> {
        console.log("Do Not Call Me");
        let [admin_courses,
             staff_courses,
             student_courses,
             handgrader_courses] = await Promise.all([
                 user.courses_is_admin_for(),
                 user.courses_is_staff_for(),
                 user.courses_is_student_in(),
                 user.courses_is_handgrader_for()
        ]);
        return {
            courses_is_admin_for: admin_courses,
            courses_is_staff_for: staff_courses,
            courses_is_student_in: student_courses,
            courses_is_handgrader_for: handgrader_courses,
        };
    }
}

export interface AllCourses {
    courses_is_admin_for: Course[];
    courses_is_staff_for: Course[];
    courses_is_student_in: Course[];
    courses_is_handgrader_for: Course[];
}
