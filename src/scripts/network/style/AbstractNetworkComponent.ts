import {INetworkLayoutCreator} from "@/scripts/network/layout/INetworkLayoutCreator";
import {ElementStyleCreator} from "@/scripts/network/style/ElementStyleCreator";
import {Variant} from "@/scripts/data/Variant";
import {Event, ipcRenderer} from "electron";
import {BreadthFirstLayout} from "@/scripts/network/layout/BreadthFirstLayout";
import {Vue} from "vue-property-decorator";

export abstract class AbstractNetworkComponent extends Vue {

    protected networkLayoutCreator: INetworkLayoutCreator = new BreadthFirstLayout();
    protected elementStyleCreator: ElementStyleCreator = new ElementStyleCreator();

    /**
     * ネットワークライブラリのセットアップ
     * */
    protected abstract setUpGraphLibrary(): void;

    /**
     * ネットワークライブラリの初期化
     * */
    protected abstract tearDownGraphLibrary(): void;

    /**
     * メインプロセスとの通信の初期設定
     * */
    private setUpIPC(): void {
        // jsonファイルの読み込み終了時の動作
        ipcRenderer.on(FileRead.CHANNEL, (event: Event, jsonString: string) => {
            // jsonのパースを同期的に行う
            this.$store.commit('parseJson', {jsonString: jsonString});
            const variants: Variant[] = this.$store.getters.getAllVariants(this.$store);
            this.setVariants(variants);
        });
    }

    /**
     * メインプロセスとの通信の初期化
     * */
    private tearDownIPC(): void {
        ipcRenderer.removeAllListeners(FileRead.CHANNEL);
    }

    /**
     * マウント時に呼び出す
     * */
    mounted() {
        this.setUpGraphLibrary();
        this.setUpIPC();
    }

    /**
     * 破棄時に呼び出す
     * */
    destroyed() {
        this.tearDownGraphLibrary();
        this.tearDownIPC();
    }

    // setter
    private setVariants(variants: Variant[]): void {
        this.removeAllElements();
        this.addElements(variants);

        this.applyElementStyle();
        this.applyLayout();
    }

    public setNetworkLayout(networkLayout: INetworkLayoutCreator): void {
        this.networkLayoutCreator = networkLayout;
        this.applyLayout();
    }

    public setElementStyleFactory(elementStyleFactory: ElementStyleCreator): void {
        this.elementStyleCreator = elementStyleFactory;
        this.applyElementStyle();
    }

    protected abstract applyElementStyle(): void;

    protected abstract applyLayout(): void;

    protected abstract addElements(variants: Variant[]): void;

    protected abstract removeAllElements(): void;
}
