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
exports.UpdateEventDto = void 0;
const class_validator_1 = require("class-validator");
class UpdateEventDto {
}
exports.UpdateEventDto = UpdateEventDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Baslik metin olmalidir.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Baslik bos olamaz.' }),
    __metadata("design:type", String)
], UpdateEventDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Aciklama metin olmalidir.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Aciklama bos olamaz.' }),
    __metadata("design:type", String)
], UpdateEventDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Konum metin olmalidir.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Konum bos olamaz.' }),
    __metadata("design:type", String)
], UpdateEventDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Baslangic tarihi gecersiz.' }),
    __metadata("design:type", String)
], UpdateEventDto.prototype, "startAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Bitis tarihi gecersiz.' }),
    __metadata("design:type", String)
], UpdateEventDto.prototype, "endAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'Kapasite sayi olmalidir.' }),
    (0, class_validator_1.Min)(1, { message: 'Kapasite en az 1 olmalidir.' }),
    __metadata("design:type", Number)
], UpdateEventDto.prototype, "capacity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Admin ID listesi dizi olmalidir.' }),
    (0, class_validator_1.IsInt)({ each: true, message: 'Her admin ID sayi olmalidir.' }),
    __metadata("design:type", Array)
], UpdateEventDto.prototype, "adminIds", void 0);
//# sourceMappingURL=update-event.dto.js.map