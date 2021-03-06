import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IBaseService } from '../base/Ibase.service';
import { Model } from 'mongoose';
import { SoutenancesModel } from './soutenances.model';
import { InjectModel } from '@nestjs/mongoose';
import UpdateSoutenancesDto from './dtos/update-soutenances.dto';
import CreateSoutenancesDto from './dtos/create-soutenances.dto';
import { UtilisateursService } from 'src/utilisateurs/utilisateurs.service';
import { PfesService } from 'src/pfes/pfes.service';
import { SessionsService } from 'src/sessions/sessions.service';
@Injectable()
export class SoutenancesService  {
  constructor(
    @InjectModel('Soutenances')
    private readonly _model: Model<SoutenancesModel>,
    private readonly _sessService: SessionsService
  ) { }

  async create(doc: CreateSoutenancesDto,sessionId : string): Promise<SoutenancesModel> {
    try {
      const session =await this._sessService.get(sessionId)
      
      const newDoc = new this._model(doc);
      session.soutenances.push(newDoc)
      session.save()
      return await newDoc.save();
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }
  async getAll(): Promise<SoutenancesModel[]> {
    try {
      const soutenances = await this._model.find({ deletedAt: undefined });
      const results = await soutenances.map((soutenance) => {
        const result = soutenance
          .populate('president')
          .populate('enseignantsEncadrants')
          .populate('rapporteur')
          .populate('student')
          .populate('pfe')
          .execPopulate()
        return result
      })


      return Promise.all(results);

    } catch (error) {
      throw new BadGatewayException(error);
    }
  }
  async getAllArchived(): Promise<SoutenancesModel[]> {
    try {
      return await this._model.find();
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }
  async getAllBySession(sessionId: string): Promise<any[]> {
    try {
      let soutenances = await this._model.find({ sessionId: sessionId, deletedAt: undefined })
      const results = await soutenances.map((soutenance) => {
        const result = soutenance
          .populate('president')
          .populate('encadrant')
          .populate('rapporteur')
          .populate('student')
          .populate('pfe')
          .execPopulate()
        return result
      })


      return Promise.all(results);;
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async get(id: string): Promise<SoutenancesModel> {
    const doc = await this._model.findOne({ _id: id, deletedAt: undefined })
    const result = await doc
      .populate('president')
      .populate('encadrant')
      .populate('rapporteur')
      .populate('student')
      .populate('pfe')
      .execPopulate()
    if (!doc) throw new NotFoundException('Doc not found');

    return result;
  }

  async delete(id: string): Promise<void> {

    const doc = await this._model.findById(id);
    if (!doc) throw new NotFoundException('Doc not found');
    await this._model.findByIdAndDelete(id);
  }

  async update(
    id: string,
    newDoc: UpdateSoutenancesDto,
  ): Promise<SoutenancesModel> {
    const doc = await this.get(id);
    if (!doc) throw new NotFoundException('Doc not found');
    return await this._model.findByIdAndUpdate(id, newDoc);
  }
  async archive(
    id: string,
    sessionId: string,
  ): Promise<SoutenancesModel[]> {
    const doc = await this.get(id);
    const session=await this._sessService.get(sessionId)
    session.soutenances = session.soutenances.filter(item=>{
      
      
      return !item._id.toString().includes(id)
    })

    await session.save()
    if (!doc) throw new NotFoundException('Doc not found');
    doc.deletedAt = new Date()
    doc.pfe=null
    await doc.save()
   
    return await this._model.find({ deletedAt: undefined });
  }
  async restore(
    id: string,
    sessionId: string,
  ): Promise<SoutenancesModel[]> {
    const doc = await this.get(id);
    if (!doc) throw new NotFoundException('Doc not found');
    doc.deletedAt = undefined
    await this._model.findByIdAndUpdate(id, doc)
    return await this._model.find({ deletedAt: { $ne: undefined }, sessionId: sessionId });
  }
}
