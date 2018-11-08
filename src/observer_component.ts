import { Model } from '@/model';
import { Vue } from 'vue/types/vue';

export class ObserverComponent extends Vue {
    created() {
        Model.get_instance().subscribe(this);
    }

    destroyed() {
        Model.get_instance().unsubscribe(this);
    }
}
