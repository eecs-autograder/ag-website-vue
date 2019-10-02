import { AppliedAnnotation, Comment, Location } from 'ag-client-typescript';

import { assert_not_null } from '@/utils';

// This module contains a polymorphic hierarchy that defines a common
// interface for AppliedAnnotations and Comments with a location.

export interface HandgradingComment {
    readonly location: Location;

    readonly short_description: string;
    readonly long_description: string;

    readonly deduction: number;
    readonly max_deduction: number | null;
    readonly vue_key: string;

    delete(): Promise<void>;
    compare(other: HandgradingComment): number;
}

export function handgrading_comment_factory(
    handgrading_commnent: AppliedAnnotation | Comment
): HandgradingComment {
    if (handgrading_commnent instanceof AppliedAnnotation) {
        return new AppliedAnnotationWrapper(handgrading_commnent);
    }
    else {
        return new CommentWrapper(handgrading_commnent);
    }
}

class AppliedAnnotationWrapper extends AppliedAnnotation implements HandgradingComment {
    get short_description() {
        return this.annotation.short_description;
    }

    get long_description() {
        return this.annotation.long_description;
    }

    get deduction() {
        return this.annotation.deduction;
    }

    get max_deduction() {
        return this.annotation.max_deduction;
    }

    get vue_key(): string {
        return `ann${this.pk}`;
    }

    compare(other: HandgradingComment) {
        return location_compare(this.location, other.location);
    }
}

class CommentWrapper implements HandgradingComment {
    comment: Comment;

    constructor(comment: Comment) {
        this.comment = comment;
        assert_not_null(this.comment.location);
    }

    get short_description() {
        return this.comment.text;
    }

    long_description = '';
    deduction = 0;
    max_deduction = null;

    get location() {
        return this.comment.location!;
    }

    delete() {
        return this.comment.delete();
    }

    compare(other: HandgradingComment) {
        return location_compare(this.location!, other.location);
    }

    get vue_key(): string {
        return `comm${this.comment.pk}`;
    }
}

function location_compare(first: Location, second: Location): number {
    if (first.filename === second.filename) {
        return first.first_line - second.first_line;
    }
    return first.filename.localeCompare(second.filename);
}
