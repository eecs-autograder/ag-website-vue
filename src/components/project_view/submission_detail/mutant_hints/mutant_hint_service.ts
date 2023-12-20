import { HttpClient } from "ag-client-typescript";

export interface UnlockedHintData {
    pk: number;
    mutation_test_suite_result: number;
    mutation_test_suite_hint_config: number;
    mutant_name: string;
    hint_number: number;
    hint_text: string;
    hint_rating: number | null;
    user_comment: string;
}

export interface HintRatingData {
    hint_rating: number;
    user_comment: string;
}

export interface MutantHintObserver {
    update_hint_unlocked(hint: UnlockedHintData): void;
    update_hint_rated(hint_pk: number, data: HintRatingData): void;
}

export class MutantHintService {
    private static _subscribers: MutantHintObserver[] = [];

    static subscribe(observer: MutantHintObserver): void {
        MutantHintService._subscribers.push(observer);
    }

    static unsubscribe(observer: MutantHintObserver): void {
        MutantHintService._subscribers.splice(
            MutantHintService._subscribers.findIndex(item => item === observer)
        );
    }

    static async get_all_unlocked_hints(group_pk: number): Promise<UnlockedHintData[]> {
        let all_hints_response = await HttpClient.get_instance().get<UnlockedHintData[]>(
        `/groups/${group_pk}/all_unlocked_mutant_hints/`
        );
        return all_hints_response.data;
    }

    static async request_new_hint(
        mutation_test_suite_result_pk: number
    ): Promise<UnlockedHintData> {
        let response = await HttpClient.get_instance().post<UnlockedHintData>(
        `/mutation_test_suite_results/${mutation_test_suite_result_pk}/hints/`
        );
        MutantHintService.notify_hint_unlocked(response.data);
        return response.data;
    }

    static async rate_hint(hint_pk: number, rating_data: HintRatingData): Promise<void> {
      await HttpClient.get_instance().patch<unknown>(
        `/unlocked_mutant_hints/${hint_pk}/`,
        rating_data
      );
      MutantHintService.notify_hint_rated(hint_pk, rating_data);
    }

    static notify_hint_unlocked(hint: UnlockedHintData): void {
        for (let subscriber of MutantHintService._subscribers) {
            subscriber.update_hint_unlocked(hint);
        }
    }

    static notify_hint_rated(hint_pk: number, data: HintRatingData): void {
        for (let subscriber of MutantHintService._subscribers) {
            subscriber.update_hint_rated(hint_pk, data);
        }
    }
}
