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

app.use(express.json());
app.use(someMiddleware);

app.get(
  "/kegiatan",
  wrap(async (_req: express.Request, res: express.Response) => {
    res
      .status(h2Status.HTTP_STATUS_OK)
      .send("Hello world! this is kegiatan get path~");
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
              res.sendStatus(h2Status.HTTP_STATUS_OK);
            })
            .catch((err: any) => {
              conn.end();
              next(err);
            });
        })
        .catch((err: any) => {
          next(err);
        });
    }
  )
);

app.listen(parseInt(process.env.SERVER_PORT!), () => {
  console.log(
    `${process.env.NODE_ENV} server start listening at port ${parseInt(
      process.env.SERVER_PORT!
    )}`
  );
});
