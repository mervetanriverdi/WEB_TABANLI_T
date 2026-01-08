"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventTag = void 0;
const typeorm_1 = require("typeorm");
const event_entity_1 = require("./event.entity");
const tag_entity_1 = require("./tag.entity");
let EventTag = class EventTag {
};
exports.EventTag = EventTag;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], EventTag.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], EventTag.prototype, "tagId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => event_entity_1.Event, (event) => event.eventTags, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'eventId' }),
    __metadata("design:type", event_entity_1.Event)
], EventTag.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tag_entity_1.Tag, (tag) => tag.eventTags, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tagId' }),
    __metadata("design:type", tag_entity_1.Tag)
], EventTag.prototype, "tag", void 0);
exports.EventTag = EventTag = __decorate([
    (0, typeorm_1.Entity)('event_tags')
], EventTag);
//# sourceMappingURL=event-tag.entity.js.map