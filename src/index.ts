import { plainToClass } from "class-transformer";
import express from "express";
import { ParamsDictionary, Query } from "express-serve-static-core";
import { constants as h2Status } from "http2";
import { KegiatanInputPort } from "./usecases/KegiatanPort";
import KegiatanEntity from "./entities/KegiatanEntity";
import "reflect-metadata";
import { validateOrReject } from "class-validator";
import dotenv, { DotenvSafeConfigOutput } from "dotenv-safe";
import path from "path";
import createPool from "./persistences/MariaDB/Connection";
import wrap from "express-async-wrap";
import mariadb from "mariadb";
import cors from "cors";
import KegiatanHarianPDF from "./pdf/KegiatanHarianPDF";
import PDFDocument from "pdfkit";
import TenagaKerjaEntity, {
  TenagaKerjaEntities,
} from "./entities/TenagaKerjaEntity";

type ExpressMiddleware<T> = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => T;

type KailaRequest = express.Request<
  ParamsDictionary,
  any,
  KegiatanInputPort,
  Query,
  Record<string, any>
>;

type KailaResponse = express.Response<any, Record<"kegiatan", KegiatanEntity>>;

export const config: DotenvSafeConfigOutput = dotenv.config({
  path: path.resolve(".env.dev"),
});

const someMiddleware: ExpressMiddleware<void> = (req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
};

const pool = createPool();

const app = express();

app.use(cors());
app.use(express.json());
app.use(someMiddleware);

interface KegiatanQueryOutputPort {
  KegiatanId: string;
  TanggalWaktuAwal: string;
  TanggalWaktuAkhir: string;
  Uraian: string;
  Lokasi: string;
  Keterangan: string;
  JobName: string;
  Jumlah: string;
}

app.get(
  "/kegiatan",
  wrap(async (_req: express.Request, res: express.Response) => {
    await pool.getConnection().then(async (conn: mariadb.PoolConnection) => {
      await conn
        .query(
          "SELECT KegiatanId, TanggalWaktuAwal, TanggalWaktuAkhir, Uraian, Lokasi, Keterangan from alkal_kegiatan_harian"
        )
        .then((rows: any) => {
          conn.end();
          const kegiatans = plainToClass(KegiatanEntity, rows);
          res.status(h2Status.HTTP_STATUS_OK).json(kegiatans);
        });
    });
  })
);

interface KegiatanQueryOutputPort {
  KegiatanId: string;
  TanggalWaktuAwal: string;
  TanggalWaktuAkhir: string;
  Uraian: string;
  Lokasi: string;
  Keterangan: string;
  JobName: string;
  Jumlah: string;
}

app.get(
  "/kegiatan/:kegiatanId",
  wrap(async (req: express.Request, res: express.Response) => {
    await pool
      .getConnection()
      .then(async (conn: mariadb.PoolConnection) => {
        await conn
          .query(
            "SELECT k.KegiatanId as KegiatanId, TanggalWaktuAwal, TanggalWaktuAkhir, Uraian, Lokasi, Keterangan, JobName, Jumlah from alkal_kegiatan_harian as k left join alkal_kegiatan_harian_tk as ktk on k.KegiatanId = ktk.KegiatanId where k.KegiatanId = ?",
            req.params.kegiatanId!
          )
          .then((rows: KegiatanQueryOutputPort[]) => {
            conn.end();
            let joinedRows: KegiatanEntity;
            if (rows!.length > 0) {
              let tenagaKerjaRaw: TenagaKerjaEntities = [];
              rows[0].TanggalWaktuAkhir;
              joinedRows = plainToClass(KegiatanEntity, rows[0], {
                excludeExtraneousValues: true,
              });
              rows.forEach((row) => {
                if (row.JobName !== null && row.Jumlah !== null) {
                  let buffer = plainToClass(TenagaKerjaEntity, {
                    kerja: row.JobName,
                    Jumlah: row.Jumlah,
                  });
                  tenagaKerjaRaw.push(buffer);
                }
              });
              joinedRows.TenagaKerjas =
                tenagaKerjaRaw.length > 0 ? tenagaKerjaRaw : null;
              res.status(h2Status.HTTP_STATUS_OK).json(joinedRows);
            } else {
              const kegiatans = plainToClass(KegiatanEntity, rows);
              res.status(h2Status.HTTP_STATUS_OK).json(kegiatans);
            }
          });
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(h2Status.HTTP_STATUS_INTERNAL_SERVER_ERROR);
      });
  })
);

app.post(
  "/kegiatan",
  async (req: KailaRequest, res: KailaResponse, next: express.NextFunction) => {
    const kegiatan = plainToClass(KegiatanEntity, req.body);
    await validateOrReject(kegiatan).then(
      () => {
        res.locals.kegiatan = kegiatan;
        next();
      },
      (errors) => {
        console.log(errors);
        res.sendStatus(h2Status.HTTP_STATUS_BAD_REQUEST);
      }
    );
  },
  wrap(
    async (
      req: KailaRequest,
      res: KailaResponse,
      next: express.NextFunction
    ) => {
      await pool
        .getConnection()
        .then(async (conn: mariadb.PoolConnection) => {
          const kegiatan: KegiatanEntity = res.locals.kegiatan;
          await conn
            .query(
              "INSERT INTO alkal_kegiatan_harian (TanggalWaktuAwal,TanggalWaktuAkhir,Uraian,Lokasi,Keterangan) value(?,?,?,?,?)",
              [
                kegiatan.TanggalWaktuAwal.toSQL({ includeOffset: false }),
                kegiatan.TanggalWaktuAkhir.toSQL({ includeOffset: false }),
                kegiatan.Uraian,
                kegiatan.Lokasi,
                kegiatan.Keterangan ? kegiatan.Keterangan : null,
              ]
            )
            .then(() => {
              conn.end();
              res.sendStatus(h2Status.HTTP_STATUS_CREATED);
            })
            .catch((err: any) => {
              conn.end();
              next(err);
            });
        })
        .catch((err: any) => {
          res.sendStatus(h2Status.HTTP_STATUS_INTERNAL_SERVER_ERROR);
        });
    }
  )
);

app.put(
  "/kegiatan/:kegiatanId",
  async (req: KailaRequest, res: KailaResponse, next: express.NextFunction) => {
    const kegiatan = plainToClass(KegiatanEntity, req.body);
    await validateOrReject(kegiatan).then(
      () => {
        res.locals.kegiatan = kegiatan;
        next();
      },
      (errors) => {
        console.log(errors);
        res.sendStatus(h2Status.HTTP_STATUS_BAD_REQUEST);
      }
    );
  },
  wrap(async (req: KailaRequest, res: express.Response) => {
    const kegiatan: KegiatanEntity = res.locals.kegiatan;
    await pool
      .getConnection()
      .then(async (conn: mariadb.PoolConnection) => {
        await conn
          .query(
            "UPDATE alkal_kegiatan_harian SET TanggalWaktuAwal=?, TanggalWaktuAkhir=?, Uraian=?, Lokasi=?, Keterangan=? WHERE KegiatanId=?",
            [
              kegiatan.TanggalWaktuAwal.toSQL({ includeOffset: false }),
              kegiatan.TanggalWaktuAkhir.toSQL({ includeOffset: false }),
              kegiatan.Uraian,
              kegiatan.Lokasi,
              kegiatan.Keterangan,
              req.params.kegiatanId!,
            ]
          )
          .then(
            () => {
              conn.end();
              res.sendStatus(h2Status.HTTP_STATUS_OK);
            },
            (err) => {
              conn.end();
              console.error(err);
              res.sendStatus(h2Status.HTTP_STATUS_NO_CONTENT);
            }
          );
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(h2Status.HTTP_STATUS_INTERNAL_SERVER_ERROR);
      });
  })
);

app.get(
  "/kegiatan/:kegiatanId/print",
  wrap(async (req: express.Request, res: express.Response) => {
    let joinedRows: KegiatanEntity;
    const conn = await pool.getConnection();
    const rows: KegiatanQueryOutputPort[] = await conn.query(
      "SELECT k.KegiatanId as KegiatanId, TanggalWaktuAwal, TanggalWaktuAkhir, Uraian, Lokasi, Keterangan, JobName, Jumlah from alkal_kegiatan_harian as k left join alkal_kegiatan_harian_tk as ktk on k.KegiatanId = ktk.KegiatanId where k.KegiatanId = ?",
      req.params.kegiatanId!
    );
    conn.end();
    if (rows!.length > 0) {
      let tenagaKerjaRaw: TenagaKerjaEntities = [];
      rows[0].TanggalWaktuAkhir;
      joinedRows = plainToClass(KegiatanEntity, rows[0], {
        excludeExtraneousValues: true,
      });
      rows.forEach((row) => {
        if (row.JobName !== null && row.Jumlah !== null) {
          let buffer = plainToClass(TenagaKerjaEntity, {
            kerja: row.JobName,
            Jumlah: row.Jumlah,
          });
          tenagaKerjaRaw.push(buffer);
        }
      });
      joinedRows.TenagaKerjas =
        tenagaKerjaRaw.length > 0 ? tenagaKerjaRaw : null;
      const filename = "test";
      const stream = res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment;filename=test.pdf`,
      });
      const onData = (chunk: any[]) => stream.write(chunk);
      const onEnd = () => stream.end();
      KegiatanHarianPDF(onData, onEnd, joinedRows);
    } else {
      const kegiatans = plainToClass(KegiatanEntity, rows);
      res.status(h2Status.HTTP_STATUS_OK).json(kegiatans);
    }
  })
);

app.get(
  "/tenagakerja/jenis",
  wrap(async (_req: express.Request, res: express.Response) => {
    try {
      const conn = await pool.getConnection();
      const rows = await conn.query("SELECT id, kerja FROM job where id <> 5"); // id 5 reserved for admin
      conn.end();
      const tenagaKerjas: TenagaKerjaEntities = plainToClass(
        TenagaKerjaEntity,
        rows,
        { excludeExtraneousValues: true }
      );
      console.log(tenagaKerjas);
      res.status(h2Status.HTTP_STATUS_OK).json(tenagaKerjas);
    } catch (error) {
      console.error(error);
      res.sendStatus(h2Status.HTTP_STATUS_INTERNAL_SERVER_ERROR);
    }
  })
);

app.listen(parseInt(process.env.SERVER_PORT!), () => {
  console.log(
    `${process.env.NODE_ENV} server start listening at port ${parseInt(
      process.env.SERVER_PORT!
    )}`
  );
});
