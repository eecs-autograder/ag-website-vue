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

    // Whether handgraders can delete this comment if they
    // are NOT allowed to leave custom comments
    readonly is_custom: boolean;

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

class AppliedAnnotationWrapper implements HandgradingComment {
    applied_annotation: AppliedAnnotation;

    constructor(applied_annotation: AppliedAnnotation) {
        this.applied_annotation = applied_annotation;
    }

    get location() {
        return this.applied_annotation.location;
    }

    get short_description() {
        return this.applied_annotation.annotation.short_description;
    }

    get long_description() {
        return this.applied_annotation.annotation.long_description;
    }

    get deduction() {
        return this.applied_annotation.annotation.deduction;
    }

    get max_deduction() {
        return this.applied_annotation.annotation.max_deduction;
    }

    delete() {
        return this.applied_annotation.delete();
    }

    get vue_key(): string {
        return `ann${this.applied_annotation.pk}`;
    }

    compare(other: HandgradingComment) {
        return location_compare(this.applied_annotation.location, other.location);
    }

    is_custom = false;
}

class CommentWrapper implements HandgradingComment {
    comment: Comment;

    // Default values so that we implement HandgradingComment correctly
    long_description = '';
    deduction = 0;
    max_deduction = null;

    constructor(comment: Comment) {
        this.comment = comment;
        assert_not_null(this.comment.location);
    }

    get short_description() {
        return this.comment.text;
    }

    get location() {
        return this.comment.location!;
    }

    delete() {
        return this.comment.delete();
    }

    compare(other: HandgradingComment) {
        // istanbul ignore next
        return location_compare(this.location!, other.location);
    }

    get vue_key(): string {
        return `comm${this.comment.pk}`;
    }

    is_custom = true;
}

function location_compare(first: Location, second: Location): number {
    if (first.filename === second.filename) {
        return first.first_line - second.first_line;
    }
    return first.filename.localeCompare(second.filename);
}
