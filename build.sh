
CURRENTPATH=`pwd`;


#格式化输出
function print() {
    echo "\n"
    echo "\033[46;30m =========================$1=========================== \033[0m"
}

#获取路径
#$1:相对路径
tmpPath="";
function getAbsolutePath() {
    cd $CURRENTPATH;
    cd $1;
    tmpPath=`pwd`;
    cd $CURRENTPATH;
    return 0;
}

#webpack监听
#$1:相对路径
function webpackWatch(){
    cd $CURRENTPATH;
    if [ -d $1 ]
    then
        cd $1;
        ./node_modules/.bin/webpack --watch &
        cd $CURRENTPATH;
    fi
    return 0;
}

#webpack打包
#$1:相对路径
function webpack(){
    cd $CURRENTPATH;
    if [ -d $1 ]
    then
        cd $1;
        ./node_modules/.bin/webpack
        cd $CURRENTPATH;
    fi
    return 0;
}

#执行build.sh
#$1:相对路径
function build(){
    cd $CURRENTPATH;
    if [ -d $1 ]
    then
        print '开始编译本地模块'$1;
        cd $1;
        sh build.sh;
        print '本地的'$1'编译完成';
        cd $CURRENTPATH;
    fi
    return 0;
}

#npm安装
#$1:相对路径
function npmInstall(){
    cd $CURRENTPATH;
    if [ ! -x $1"/node_modules" ]
    then
        cd $1;
        print `pwd`'下没有node_modules, 开始安装npm包依赖';
        npm install --registry https://registry.npm.taobao.org;
        cd $CURRENTPATH;
    fi
    return 0;
}

#################################此处开始执行###########################################

print '编译swan-app开始前的准备工作'

#重置产出文件夹
rm -rf "./dist"
mkdir "./dist"

#如果没有安装npm包，则安装一次。此处需要注意：如果npm包有更新，编译脚本无法探测到，需要手动安装
npmInstall '.';

#如果有本地模块，则使用本地文件，为节省时间，此处为并行执行；

sh $CURRENTPATH/tool/link-modules.sh;

print '编译swan-app开始前的准备工作已完成'

#开始使用webpack编译swan-app
if [ "$1" == "watch" ]
then
    #同时触发多个模块监听（如果有本地模块）
    print '开始正式编译swan-app';
    webpackWatch '../swan-js' & webpackWatch '../swan-components' & webpackWatch $CURRENTPATH &
    print 'swan-app编译完成，已启动webpack监听';
else
    #同时触发本地多模块的编译脚本，为节省时间，此处为并行执行，完成后再触发swan-app的编译脚本;
    build '../swan-js' & build '../swan-components'& build '../swan-js-api';
    wait;
    print '开始正式编译swan-app';
	webpack $CURRENTPATH;
    mkdir -p output
    print '正在生成pkginfo';
    node tool/make-pkginfo.js
    print '开始zip swan-app';
    cd ./dist/box/
    zip -r box.zip ./*
    cd $CURRENTPATH
    mv ./dist/box/box.zip output/
    print 'swan-app编译完成';
fi
