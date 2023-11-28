.PHONY: jar

STAGE_DIR = stage
BASE_IMAGE_TAG = latest
BUILD_IMAGE_TAG = latest

copy_mgr:
	cp licenses/* ${STAGE_DIR}/licenses/
	cp cli/cli ${STAGE_DIR}/usr/local/bin/
	cp -r cli/prog ${STAGE_DIR}/usr/local/bin/
	cp scripts/* ${STAGE_DIR}/usr/local/bin/
	cp java.security ${STAGE_DIR}/usr/lib/jvm/java-11-openjdk/lib/security/java.security
	cp admin/target/scala-2.11/admin-assembly-1.0.jar ${STAGE_DIR}/usr/local/bin/

stage_init:
	rm -rf ${STAGE_DIR}; mkdir -p ${STAGE_DIR}
	mkdir -p ${STAGE_DIR}/usr/local/bin/
	mkdir -p ${STAGE_DIR}/licenses/
	mkdir -p ${STAGE_DIR}/usr/lib/jvm/java-11-openjdk/lib/security/

stage_mgr: stage_init copy_mgr

pull_base:
	docker pull neuvector/manager_base:${BASE_IMAGE_TAG}

manager_image: pull_base stage_mgr
	docker build --build-arg NV_TAG=$(NV_TAG) --build-arg BASE_IMAGE_TAG=${BASE_IMAGE_TAG} --no-cache=true -t neuvector/manager -f Dockerfile.manager .

jar:
	@echo "Pulling images ..."
	docker pull neuvector/build_manager:${BUILD_IMAGE_TAG}
	@echo "Making $@ ..."
	docker run --rm -ia STDOUT --name build -v prebuild_manager:/prebuild/manager -v $(CURDIR):/manager -w /manager --entrypoint ./make_jar.sh neuvector/build_manager:${BUILD_IMAGE_TAG}
