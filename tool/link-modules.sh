CURRENTPATH=`pwd`;
tmpPath="";
allModules='swan-core,swan-api,swan-components';
#格式化输出
function print() {
    echo "\n"
    echo "\033[46;30m =========================$1========================= \033[0m"
}

function getAbsolutePath() {
    cd $CURRENTPATH;
    cd $1;
    tmpPath=`pwd`;
    cd $CURRENTPATH;
    return 0;
}

function npmLinkLocalModule(){
    cd $CURRENTPATH;
    relativePath='../'$1;
    if [ -d '../'$1 ]
    then
        print $2'编译中在本地文件发现'$1', 使用本地的'$1;
        cd $relativePath;
        getAbsolutePath $relativePath;
        npm link $tmpPath;
        print $1'已merge到'$2;
        cd $CURRENTPATH;
    fi
    return 0;
}

function npmLinkLocalModules(){
    cd $CURRENTPATH;
    arguments=(${1//,/ });
    for var in ${arguments[@]}
        do
        tmp=`echo $allModules|grep $var`;
        if [ "$tmp" != "" ];then
            npmLinkLocalModule $var 'swan-app' &
        fi
    done 
}

function npmUnLinkLocalModule(){
    cd $CURRENTPATH;
    relativePath='../'$1;
    if [ -d '../'$1 ]
    then
        print '开始在'$2'中卸载本地'$1;
        cd $relativePath;
        getAbsolutePath $relativePath;
        npm unlink $tmpPath;
        print '已从'$2'中卸载'$1;
        cd $CURRENTPATH;
    fi
    return 0;
}

function npmUnLinkLocalModules(){
    cd $CURRENTPATH;
    arguments=($1);
    for var in ${arguments[@]}
        do
        tmp=`echo $allModules |grep $var`;
        if [ "$tmp" != "" ];then
            npmUnLinkLocalModule $var 'swan-app' &
        fi
    done 
}

getUnLinkModule(){
    unLinkModules='';
    all=(${allModules//,/ });
    for var in ${all[@]}
        do
        tmp=`echo $1 |grep $var`;
        if [ "$tmp" == "" ];then
            unLinkModules=$unLinkModules' '$var;
        fi
    done
}

# 默认link全部
if [ "$1" = "" ]; then
    npmLinkLocalModules $allModules;

# $1=swan-core,swan-api..... 
else
    npmLinkLocalModules $1;
    getUnLinkModule $1;
    npmUnLinkLocalModules "$unLinkModules"
fi;
wait;
