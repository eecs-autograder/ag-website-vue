import { Model } from '@/model';
import Vue from 'vue';

export class ObserverComponent extends Vue {
    created() {
        Model.get_instance().subscribe(this);
    }

    // tslint:disable-next-line:naming-convention
    beforeDestroy() {
        Model.get_instance().unsubscribe(this);
    }
}
