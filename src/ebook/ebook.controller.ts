import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Logger,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { EbookService } from "./ebook.service";
import { Prisma } from "@prisma/client";
import { Role } from "src/decorators/roles.decorator";
import { ActiveUserId } from "src/decorators/active-user-id";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("ebook")
export class EbookController {
  private readonly logger = new Logger(EbookController.name);
  constructor(private readonly ebookService: EbookService) {}

  @Role("ADMIN")
  @Get("all")
  async getEbooks() {
    return this.ebookService.getEbooks();
  }

  @Get("me")
  async getUserEbooks(@ActiveUserId() userId: string) {
    return this.ebookService.getUserEbooks(userId);
  }

  @Role("ADMIN")
  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async createEbook(
    @Body() ebook: Prisma.EbookCreateInput,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 100, // 100MB
          }),
          new FileTypeValidator({
            fileType: ".(pdf)",
          }),
        ],
      })
    )
    file: Express.Multer.File,
    @ActiveUserId() userId: string
  ) {
    this.logger.log(`User ${userId} is creating a new ebook`);
    return this.ebookService.createEbook(ebook, file);
  }

  @Role("ADMIN")
  @Put(":id")
  async updateEbook(
    @Param("id") id: string,
    @Body() ebook: Prisma.EbookUpdateInput,
    @ActiveUserId() userId: string
  ) {
    this.logger.log(`User ${userId} is updating ebook with ID: ${id}`);
    return this.ebookService.updateEbook(id, ebook);
  }

  @Role("ADMIN")
  @Delete(":id")
  async deleteEbook(@Param("id") id: string, @ActiveUserId() userId: string) {
    this.logger.log(`User ${userId} is deleting ebook with ID: ${id}`);
    return this.ebookService.deleteEbook(id);
  }
}
