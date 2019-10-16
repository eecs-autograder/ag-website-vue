import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness_icon.vue';

export function setup_return_code_correctness(setup_return_code: number | null,
                                              setup_timed_out: boolean | null) {
    if (setup_timed_out !== null && setup_timed_out) {
        return CorrectnessLevel.none_correct;
    }
    if (setup_return_code !== null) {
        if (setup_return_code === 0) {
            return CorrectnessLevel.all_correct;
        }
        return CorrectnessLevel.none_correct;
    }
    return CorrectnessLevel.not_available;
}
