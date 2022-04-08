FROM --platform=${TARGETPLATFORM:-linux/amd64} ghcr.io/openfaas/of-watchdog:0.9.3 AS watchdog
FROM --platform=${TARGETPLATFORM:-linux/amd64} denoland/deno:1.20.4 AS ship 
# RUN curl -fsSL https://deno.land/x/install/install.sh | sh

COPY --from=watchdog /fwatchdog /usr/bin/fwatchdog
RUN chmod +x /usr/bin/fwatchdog

RUN addgroup --system app \
    && adduser --system --ingroup app app
RUN chmod 777 /tmp
RUN chmod 777 /deno-dir

USER app

RUN mkdir -p /home/app
WORKDIR /home/app
COPY index.ts ./

WORKDIR /home/app/function
COPY ./function ./
COPY --chown=app:app function/ .
RUN deno test 

# WORKDIR /home/app 
# RUN deno cache index.ts 

WORKDIR /home/app/
ENV fprocess="deno run --allow-net --allow-env index.ts"
ENV cgi_headers="true"
ENV mode="http"
ENV upstream_url="http://127.0.0.1:3000"
ENV exec_timeout="10s"
ENV write_timeout="15s"
ENV read_timeout="15s"
ENV prefix_logs="false"
HEALTHCHECK --interval=3s CMD [ -e /tmp/.lock ] || exit 1
CMD ["fwatchdog"]