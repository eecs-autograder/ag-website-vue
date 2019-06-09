// https://vuejs.org/v2/guide/instance.html#Instance-Lifecycle-Hooks

// tslint:disable:naming-convention

export interface BeforeCreate {
    beforeCreate(): void;
}

export interface Created {
    created(): void;
}

export interface BeforeMount {
    beforeMount(): void;
}

export interface Mounted {
    mounted(): void;
}

export interface BeforeUpdate {
    beforeUpdate(): void;
}

export interface Updated {
    updated(): void;
}

export interface BeforeDestroy {
    beforeDestroy(): void;
}

export interface Destroyed {
    destroyed(): void;
}
